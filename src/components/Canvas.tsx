import { resolveTokens } from '@solid-primitives/jsx-tokenizer'
import {
  Component,
  createEffect,
  createSignal,
  JSX,
  mapArray,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'
import { Color, Position } from 'src'
import { CanvasContext } from 'src/context'
import { CanvasMouseEvent, CanvasToken, parser, Path2DToken } from 'src/parser'
import { getColor, getExtendedColor } from 'src/utils/getColor'

export const Canvas: Component<{
  children: JSX.Element
  style: JSX.CSSProperties
  background?: Color
  origin?: Position
  alpha?: boolean
  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}> = props => {
  const [stack, setStack] = createSignal<CanvasToken[]>([])
  const [canvasDimensions, setCanvasDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const canvas = (
    <canvas
      width={canvasDimensions().width}
      height={canvasDimensions().height}
      style={props.style}
      onMouseDown={e => mouseDownHandler(e)}
      onMouseMove={e => mouseMoveHandler(e)}
      onMouseUp={e => mouseUpHandler(e)}
    />
  ) as HTMLCanvasElement
  const ctx = canvas.getContext('2d', { alpha: props.alpha })!

  let lastPosition: Position | undefined

  const mouseEventHandler = (
    e: MouseEvent,
    type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp',
    final: (event: CanvasMouseEvent) => void,
  ) => {
    const position = { x: e.clientX, y: e.clientY }
    const delta = lastPosition
      ? { x: position.x - lastPosition.x, y: position.y - lastPosition.y }
      : { x: 0, y: 0 }
    lastPosition = position
    let stop = false
    const event: CanvasMouseEvent = {
      ctx,
      position,
      delta,
      stopPropagation: () => (stop = true),
      target: [],
      type,
    }
    let i = stack().length - 1
    let token: CanvasToken | undefined
    while ((token = stack()[i])) {
      // if (token.type === 'Path2D') {
      if ('hitTest' in token) {
        token.hitTest(event)
        /* const inBounds = isPointInShape(token, event)
        if (inBounds) callback(event, token)
        if (inBounds) event.target.push(token)
        if (inBounds && stop) break */
      }
      i--
    }

    if (!stop) final(event)

    return event
  }

  const mouseDownHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseDown', event => props.onMouseDown?.(event))
  }
  const mouseMoveHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseMove', event => props.onMouseMove?.(event))
  }
  const mouseUpHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseUp', event => props.onMouseUp?.(event))
    lastPosition = undefined
  }

  onMount(() => {
    const updateDimensions = () => {
      const { width, height } = canvas.getBoundingClientRect()
      setCanvasDimensions({
        width,
        height,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
  })

  return (
    <>
      {canvas}
      <CanvasContext.Provider
        value={{
          ctx,
          get origin() {
            return props.origin ?? { x: 0, y: 0 }
          },
        }}
      >
        {untrack(() => {
          const tokens = resolveTokens(parser, () => props.children)
          // TODO: bookkeep z-index
          const map = mapArray(tokens, (token, i) => {
            const index = stack().length - i()

            setStack(stack => [...stack.slice(0, index), token.data, ...stack.slice(index)])
            onCleanup(() => {
              const index = stack().length - i()
              setStack(stack => [...stack.slice(0, index - 1), ...stack.slice(index)])
            })
          })
          createEffect(map)

          const render = () => {
            ctx.save()
            ctx.beginPath()
            ctx.clearRect(0, 0, canvasDimensions().width, canvasDimensions().height)
            if (props.background) {
              ctx.fillStyle = getColor(props.background) ?? 'white'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            ctx.restore()
            stack().forEach(token => {
              ctx.save()
              if ('render' in token) token.render(ctx)
              ctx.restore()
            })
          }

          createEffect(() => render())

          return ''
        })}
      </CanvasContext.Provider>
    </>
  )
}
