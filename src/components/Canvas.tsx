import { resolveTokens } from '@solid-primitives/jsx-tokenizer'
import {
  Component,
  createEffect,
  createSignal,
  JSX,
  mapArray,
  onCleanup,
  onMount,
  Show,
  untrack,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { CanvasContext } from 'src/context'
import { CanvasToken, parser } from 'src/parser'
import { Color, Position, CanvasMouseEvent } from 'src/types'
import { resolveColor } from 'src/utils/resolveColor'
import revEach from 'src/utils/revEach'
import withContext from 'src/utils/withContext'

/**
 * All `solid-canvas`-components have to be inside a `Canvas`
 */

export const Canvas: Component<{
  children: JSX.Element
  style: JSX.CSSProperties
  fill?: Color
  origin?: Position
  alpha?: boolean
  stats?: boolean
  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}> = props => {
  const [stack, setStack] = createSignal<CanvasToken[]>([])
  const [canvasDimensions, setCanvasDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [stats, setStats] = createStore<{ fps?: number; memory?: { used: number; total: number } }>(
    {},
  )

  let lastCursorPosition: Position | undefined
  let startRenderTime: number

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
  const ctx = canvas.getContext('2d', {
    alpha: props.alpha,
    willReadFrequently: true,
  })!

  const tokens = resolveTokens(
    parser,
    withContext(() => props.children, CanvasContext, {
      ctx,
      get origin() {
        return props.origin ?? { x: 0, y: 0 }
      },
      addEventListener: (
        type: CanvasMouseEvent['type'],
        callback: (event: CanvasMouseEvent) => void,
      ) => {
        setEventListeners(type, listeners => [...listeners, callback])
      },
      removeEventListener: (
        type: CanvasMouseEvent['type'],
        callback: (event: CanvasMouseEvent) => void,
      ) => {
        setEventListeners(type, listeners => {
          const index = listeners.indexOf(callback)
          const result = [...listeners.slice(0, index), ...listeners.slice(index + 1)]
          return result
        })
      },
    }),
  )
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
    startRenderTime = performance.now()

    ctx.save()
    ctx.beginPath()
    ctx.clearRect(0, 0, canvasDimensions().width, canvasDimensions().height)
    if (props.fill) {
      ctx.fillStyle = resolveColor(props.fill) ?? 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.restore()
    stack().forEach(token => {
      ctx.save()
      if ('render' in token) token.render(ctx)
      ctx.restore()
    })
    if (props.stats) {
      setStats({
        fps: Math.floor(1000 / (performance.now() - startRenderTime)),
        memory:
          'memory' in performance
            ? {
                // NOTE: performance.memory is chrome-only
                used: Math.floor((performance.memory as any).usedJSHeapSize / 1048576),
                total: Math.floor((performance.memory as any).jsHeapSizeLimit / 1048576),
              }
            : undefined,
      })
    }
  }

  createEffect(render)

  const [eventListeners, setEventListeners] = createStore<{
    onMouseDown: ((event: CanvasMouseEvent) => void)[]
    onMouseMove: ((event: CanvasMouseEvent) => void)[]
    onMouseUp: ((event: CanvasMouseEvent) => void)[]
  }>({
    onMouseDown: [],
    onMouseMove: [],
    onMouseUp: [],
  })

  const mouseEventHandler = (
    e: MouseEvent,
    type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp',
    final: (event: CanvasMouseEvent) => void,
  ) => {
    const position = { x: e.clientX, y: e.clientY }
    const delta = lastCursorPosition
      ? { x: position.x - lastCursorPosition.x, y: position.y - lastCursorPosition.y }
      : { x: 0, y: 0 }
    lastCursorPosition = position
    let stop = false
    const event: CanvasMouseEvent = {
      ctx,
      position,
      delta,
      stopPropagation: () => (stop = true),
      target: [],
      type,
    }

    revEach(stack(), token => {
      if ('hitTest' in token) {
        token.hitTest(event)
      }
    })

    if (!stop) final(event)

    eventListeners[type].forEach(listener => listener(event))

    return event
  }

  const mouseDownHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseDown', event => props.onMouseDown?.(event))
  }
  const mouseMoveHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseMove', event => {
      props.onMouseMove?.(event)
    })
  }
  const mouseUpHandler = (e: MouseEvent) => {
    mouseEventHandler(e, 'onMouseUp', event => props.onMouseUp?.(event))
    lastCursorPosition = undefined
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
      <Show when={props.stats}>
        <div
          style={{
            background: 'white',
            margin: '5px',
            padding: '5px',
            position: 'absolute',
            bottom: '0px',
            left: '0px',
            'font-family': 'monospace',
            'user-select': 'none',
          }}
        >
          fps: {stats.fps}
          <br />
          mem: {stats.memory?.used} / {stats.memory?.total}
        </div>
      </Show>
      {canvas}
    </>
  )
}
