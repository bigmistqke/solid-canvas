import { resolveTokens } from '@solid-primitives/jsx-parser'
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
import { Position } from '..'
import { CanvasContext } from '../context'
import { CanvasMouseEvent, CanvasToken, parser, Path2DToken } from '../parser'
import { getExtendedColor } from '../utils/getColor'

export const Canvas: Component<{
  to?: string
  children: JSX.Element
  style: JSX.CSSProperties
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
  const ctx = canvas.getContext('2d')!

  const isPointInPath = (token: Path2DToken, event: CanvasMouseEvent) => {
    // TODO:  can not check for token.props.fill as it would re-mount ColorTokens

    // if (!token.props.fill) return false
    return event.ctx.isPointInPath(token.path(), event.position.x, event.position.y)
  }
  const isPointInStroke = (token: Path2DToken, event: CanvasMouseEvent) => {
    // TODO:  can not check for token.props.fill as it would re-mount ColorTokens

    // if (!token.props.stroke) return false
    return event.ctx.isPointInStroke(token.path(), event.position.x, event.position.y)
  }

  const isPointInShape = (token: Path2DToken, event: CanvasMouseEvent) => {
    return isPointInPath(token, event) || isPointInStroke(token, event)
  }

  let lastPosition: Position | undefined

  const mouseEventHandler = (
    e: MouseEvent,
    callback: (event: CanvasMouseEvent, token: Path2DToken) => void,
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
    }
    let i = stack().length - 1
    let token: CanvasToken | undefined
    while ((token = stack()[i])) {
      if (token.type !== 'Path2D') continue
      const inBounds = isPointInShape(token, event)
      if (inBounds) callback(event, token)
      if (inBounds) event.target.push(token)
      if (inBounds && stop) break
      i--
    }

    if (!stop) final(event)

    return event
  }

  const mouseDownHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.props.onMouseDown?.(event),
      event => props.onMouseDown?.(event),
    )
  }
  const mouseMoveHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.props.onMouseMove?.(event),
      event => props.onMouseMove?.(event),
    )
  }
  const mouseUpHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.props.onMouseUp?.(event),
      event => props.onMouseUp?.(event),
    )
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

          const renderPath = (token: Path2DToken) => {
            if (token.type !== 'Path2D') return
            ctx.setLineDash(token.props.dash ?? [])
            ctx.strokeStyle = getExtendedColor(token.props.stroke) ?? 'black'
            ctx.fillStyle = getExtendedColor(token.props.fill) ?? 'transparent'
            ctx.lineWidth = token.props.lineWidth
            ctx.fill(token.path())
            ctx.stroke(token.path())
            ctx.setLineDash([])
          }

          const render = () => {
            ctx.beginPath()
            ctx.clearRect(0, 0, canvasDimensions().width, canvasDimensions().height)
            stack().forEach(token => {
              if (token.type === 'Path2D') renderPath(token)
            })
          }

          createEffect(() => render())

          return ''
        })}

        {/* {props.children} */}
      </CanvasContext.Provider>
    </>
  )
}
