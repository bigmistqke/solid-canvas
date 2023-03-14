import { resolveTokens } from '@solid-primitives/jsx-parser'
import {
  Component,
  createEffect,
  createSignal,
  mapArray,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { Position } from '..'
import { CanvasContext } from '../context'
import { CanvasMouseEvent, CanvasToken, parser } from '../parser'

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

  const mouseEventHandler = (
    e: MouseEvent,
    callback: (event: CanvasMouseEvent, token: CanvasToken) => boolean,
    final: (event: CanvasMouseEvent) => any,
  ) => {
    const position = { x: e.clientX, y: e.clientY }
    const delta = { x: e.movementX, y: e.movementY }
    let stop = false
    const event: CanvasMouseEvent = {
      ctx,
      position,
      delta,
      stopPropagation: () => (stop = true),
      target: [],
    }

    for (let token of stack()) {
      const inBounds = callback(event, token)
      if (inBounds) event.target.push(token)
      if (inBounds && stop) break
    }

    if (!stop) final(event)

    return event
  }

  const mouseDownHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.mouseDown(event),
      event => props.onMouseDown?.(event),
    )
  }
  const mouseMoveHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.mouseMove(event),
      event => props.onMouseMove?.(event),
    )
  }
  const mouseUpHandler = (e: MouseEvent) => {
    mouseEventHandler(
      e,
      (event, token) => token.mouseUp(event),
      event => props.onMouseUp?.(event),
    )
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

  const render = () => {
    ctx.beginPath()
    ctx.clearRect(0, 0, canvasDimensions().width, canvasDimensions().height)
    stack().forEach(token => token.render(ctx))
  }

  createEffect(() => render())

  return (
    <>
      {canvas}
      <CanvasContext.Provider value={{}}>
        {untrack(() => {
          const tokens = resolveTokens(parser, () => props.children)
          // TODO: bookkeep z-index
          const map = mapArray(tokens, (token, i) => {
            // stack.splice(i(), 0, token.data)
            setStack(stack => [...stack, token.data])
            onCleanup(() => console.log('token removed itself'))
          })
          createEffect(map)
          return ''
        })}

        {/* {props.children} */}
      </CanvasContext.Provider>
    </>
  )
}
