import { Component, createMemo, createSignal, on, Show } from 'solid-js'
import { Arc, Canvas, useCanvas, createClock } from 'src'
import { Composite, Position } from 'src/types'

const randomColor = (alpha?: number) => ({
  h: Math.random() * 360,
  s: 50,
  l: 50,
  a: alpha ?? 0.5,
})

const Dot = (props: {
  switchColor: number
  position: Position
  switchScene: number
}) => {
  const context = useCanvas()
  const [position, setPosition] = createSignal({ x: 0, y: 0 })

  const delta = Math.random() * 10 + 20

  context?.onFrame(() => {
    setPosition({
      x:
        props.position.x -
        radius() +
        Math.sin(performance.now() / (10 * delta) + delta) * 10,
      y:
        props.position.y -
        radius() +
        Math.cos(performance.now() / (10 * delta) + delta) * 10,
    })
  })

  const fill = createMemo(
    on(
      () => props.switchColor,
      () => randomColor(Math.random() + 0.2),
    ),
  )

  const radius = createMemo(
    on(
      () => props.switchScene,
      () => 50 * Math.random() * 2 + 25,
    ),
  )
  return (
    <Arc
      position={{ x: position().x, y: position().y }}
      radius={radius()}
      fill={fill()}
      stroke="transparent"
      draggable
      pointerEvents={false}
    />
  )
}

const fxs: {
  filter: string
  alpha: number
  composite?: Composite
  offset?: { x: number; y: number } | (() => { x: number; y: number })
  double?: boolean
}[] = [
  {
    filter: ``,
    alpha: 0.9,
    composite: 'source-over',
  },
  {
    filter: `hue-rotate(10deg) brightness(101%)`,
    alpha: 0.1,
    composite: 'source-over',
    offset: {
      x: 2,
      y: 2,
    },
  },
  {
    filter: ``,
    alpha: 0.1,
    offset: {
      x: 0,
      y: -5,
    },
    composite: 'lighten',
  },
  {
    filter: ``,
    alpha: 0.75,
    offset: () => ({
      x: -1 * Math.sin(performance.now() / 5000),
      y: -1 * Math.cos(performance.now() / 5000),
    }),
    composite: 'source-over',
    double: true,
  },
]

const App: Component = () => {
  const [switchScene, setSwitchScene] = createSignal(0)
  const [cursor, setCursor] = createSignal<{ x: number; y: number }>()
  const fill = randomColor(1)

  const clock = createClock()
  clock.start()

  const switchColor = createMemo(() => Math.floor(clock.clock() / 200))

  const incrementSwitchScene = () => setSwitchScene(c => (c + 1) % fxs.length)

  window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault()
      incrementSwitchScene()
    }
  })

  const feedback = (ctx: CanvasRenderingContext2D) => {
    const bitmap = createImageBitmap(ctx.canvas)
    bitmap.then(bitmap => {
      const fx = fxs[switchScene()]
      ctx.restore()
      ctx.save()
      ctx.globalAlpha = fx?.alpha ?? 1
      if (fx?.composite) ctx.globalCompositeOperation = fx?.composite

      ctx.filter = fx?.filter ?? ''

      const offset =
        typeof fx?.offset === 'function' ? fx?.offset() : fx?.offset
      ctx.drawImage(
        bitmap,
        offset?.x ?? 0,
        offset?.y ?? 0,
        ctx.canvas.width,
        ctx.canvas.height,
      )
      if (fx?.double) {
        ctx.globalAlpha = 0.25
        ctx.drawImage(
          bitmap,
          (offset?.x ?? 0) * 5,
          (offset?.y ?? 0) * 5,
          ctx.canvas.width,
          ctx.canvas.height,
        )
      }
      ctx.restore()
      bitmap.close()
    })
  }

  return (
    <>
      <Canvas
        fill={fill}
        clock={clock.clock()}
        style={{ width: '100%', height: '100%' }}
        alpha
        feedback={feedback}
        cursor="crosshair"
        onMouseMove={event => setCursor(event.position)}
        onMouseDown={event => incrementSwitchScene()}
      >
        <Show when={cursor()}>
          <Dot
            switchColor={switchColor()}
            switchScene={switchScene()}
            position={cursor()!}
          />
        </Show>
      </Canvas>
    </>
  )
}

export default App
