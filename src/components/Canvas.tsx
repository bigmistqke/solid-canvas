import { resolveTokens } from '@solid-primitives/jsx-tokenizer'
import { createScheduled, throttle } from '@solid-primitives/scheduled'
import {
  Accessor,
  Component,
  createEffect,
  createSelector,
  createSignal,
  JSX,
  on,
  onCleanup,
  onMount,
  Show,
  untrack,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { InternalContext } from 'src/context/InternalContext'
import { UserContext } from 'src/context/UserContext'

import { CanvasToken, parser } from 'src/parser'
import {
  CanvasFlags,
  CanvasMouseEvent,
  CanvasMouseEventTypes,
  Color,
  Composite,
  CursorStyle,
  Transforms,
  Vector,
} from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createMouseEventHandler } from 'src/utils/createMouseEventHandler'
import forEachReversed from 'src/utils/forEachReversed'
import { resolveColor } from 'src/utils/resolveColor'
import withContext from 'src/utils/withContext'
import { should } from 'vitest'

/**
 * All `solid-canvas`-components have to be inside a `Canvas`
 */

export const Canvas: Component<{
  children: JSX.Element
  style?: JSX.CSSProperties
  fill?: Color
  transform?: Transforms
  alpha?: boolean
  stats?: boolean
  draggable?: boolean
  debug?: boolean
  clock?: number
  cursor?: CursorStyle
  feedback?:
    | ((ctx: CanvasRenderingContext2D) => void)
    | true
    | {
        opacity?: number
        composite?: Composite
        filter?: string
        offset?: Vector | Accessor<Vector>
      }
  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
  onFrame?: (args: { clock: number }) => void
}> = props => {
  const [canvasDimensions, setCanvasDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const [originPosition, setOriginPosition] = createSignal({ x: 0, y: 0 })

  const [cursorStyle, setCursorStyle] = createSignal<CursorStyle>('default')
  const [eventListeners, setEventListeners] = createStore<
    Record<CanvasMouseEventTypes, ((event: CanvasMouseEvent) => void)[]>
  >({
    onMouseDown: [],
    onMouseMove: [],
    onMouseUp: [],
    onMouseEnter: [],
    onMouseLeave: [],
  })

  const [stats, setStats] = createStore<{
    fps?: number
    memory?: { used: number; total: number }
  }>({})

  let startRenderTime: number

  const canvas = (
    <canvas
      width={canvasDimensions().width}
      height={canvasDimensions().height}
      style={{ cursor: cursorStyle(), ...props.style }}
      onMouseDown={e => mouseDownHandler(e)}
      onMouseMove={e => mouseMoveHandler(e)}
      onMouseUp={e => mouseUpHandler(e)}
    />
  ) as HTMLCanvasElement

  const ctx = canvas.getContext('2d', {
    alpha: props.alpha,
    willReadFrequently: true,
  })!

  const frameQueue = new Set<(args: { clock: number }) => void>()

  const matrix = createMatrix(() => props)

  const flags: Record<CanvasFlags, boolean> = {
    shouldHitTest: true,
  }

  const setFlag = (key: CanvasFlags, value: boolean) => {
    flags[key] = value
  }

  const context = {
    ctx,
    setFlag: setFlag,
    get flags() {
      return flags
    },
    get debug() {
      return !!props.debug
    },
    get matrix() {
      return matrix()
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
        const result = [
          ...listeners.slice(0, index),
          ...listeners.slice(index + 1),
        ]
        return result
      })
    },
  }

  const tokens = resolveTokens(
    parser,
    withContext(
      () => props.children,
      [
        {
          context: InternalContext,
          value: context,
        },
        {
          context: UserContext,
          value: {
            onFrame: (callback: (args: { clock: number }) => void) => {
              frameQueue.add(callback)
              onCleanup(() => frameQueue.delete(callback))
            },
          },
        },
      ],
    ),
  )

  const render = () => {
    startRenderTime = performance.now()

    untrack(() => {
      props.onFrame?.({ clock: props.clock ?? 0 })
      frameQueue.forEach(frame => {
        frame({ clock: props.clock ?? 0 })
      })
    })

    ctx.save()
    if (typeof props.feedback === 'number' || props.feedback) {
      if (typeof props.feedback === 'function') props.feedback(ctx)
      else if (typeof props.feedback === 'object') {
        const feedback = props.feedback
        const bitmap = createImageBitmap(ctx.canvas)
        bitmap.then(bitmap => {
          ctx.restore()
          ctx.save()
          ctx.globalAlpha = feedback.opacity ?? 1
          if (feedback.composite)
            ctx.globalCompositeOperation = feedback.composite
          if (feedback.filter) ctx.filter = feedback.filter ?? ''
          const offset =
            typeof feedback.offset === 'function'
              ? feedback.offset()
              : feedback.offset
          ctx.drawImage(
            bitmap,
            offset?.x ?? 0,
            offset?.y ?? 0,
            ctx.canvas.width,
            ctx.canvas.height,
          )
          ctx.restore()
          bitmap.close()
        })
      }
    } else {
      ctx.clearRect(0, 0, canvasDimensions().width, canvasDimensions().height)
    }

    ctx.restore()

    forEachReversed(tokens(), token => {
      if (props.debug && 'debug' in token.data) token.data.debug(ctx)
      if ('render' in token.data) token.data.render(ctx)
    })

    if (props.fill) {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = resolveColor(props.fill) ?? 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }

    if (props.stats) {
      setStats('fps', performance.now() - startRenderTime)
      setStats(
        'memory',
        'memory' in performance
          ? {
              // NOTE: performance.memory is chrome-only
              used: Math.floor(
                (performance.memory as any).usedJSHeapSize / 1048576,
              ),
              total: Math.floor(
                (performance.memory as any).jsHeapSizeLimit / 1048576,
              ),
            }
          : undefined,
      )
    }
  }

  const scheduled = createScheduled(fn => throttle(fn))

  createEffect(() => {
    if (!!props.clock || props.clock === 0) return
    if (scheduled()) render()
  })
  createEffect(
    on(
      () => props.clock,
      () => untrack(() => render()),
    ),
  )

  const initPan = () => {
    const handleMouseMove = (event: MouseEvent) => {
      setOriginPosition(position => ({
        x: position.x + event.movementX,
        y: position.y + event.movementY,
      }))
    }
    const handleMouseUp = (event: MouseEvent) => {
      setCursorStyle('default')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const mouseMoveHandler = createMouseEventHandler(
    'onMouseMove',
    tokens,
    context,
    eventListeners,
    event => {
      props.onMouseMove?.(event)
    },
  )

  const mouseDownHandler = createMouseEventHandler(
    'onMouseDown',
    tokens,
    context,
    eventListeners,
    event => {
      if (props.draggable) {
        initPan()
      }
      props.onMouseDown?.({
        ...event,
        position: {
          x: event.position.x - originPosition().x,
          y: event.position.y - originPosition().y,
        },
      })
    },
  )

  const mouseUpHandler = createMouseEventHandler(
    'onMouseUp',
    tokens,
    context,
    eventListeners,
    event => {
      props.onMouseUp?.(event)
    },
  )

  onMount(() => {
    const updateDimensions = () => {
      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
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
          spf: {Math.floor(stats.fps ?? 0) / 1000}
          <br />
          fps: {stats.fps ? Math.floor(1000 / stats.fps) : undefined}
          <br />
          {stats.memory
            ? `mem: ${stats.memory.used} / ${stats.memory.total}`
            : undefined}
        </div>
      </Show>
      {canvas}
    </>
  )
}
