import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  Show,
} from 'solid-js'
import { Arc, Bezier, Canvas, Group, useCanvas, createClock } from 'src'
import { Position } from 'src/types'

const randomColor = (alpha?: number) => ({
  h: Math.random() * 360,
  s: 50,
  l: 50,
  a: alpha ?? 0.5,
})

const Smiley = (props: { counter: number; position: Position }) => {
  const context = useCanvas()
  const [position, setPosition] = createSignal({ x: 0, y: 0 })

  const delta = Math.random() * 10 + 20

  context?.onFrame(() => {
    setPosition({
      x:
        props.position.x -
        50 * scale +
        Math.sin(performance.now() / (20 * delta) + delta) * 20,
      y:
        props.position.y -
        50 * scale +
        Math.cos(performance.now() / (20 * delta) + delta) * 20,
    })
  })

  const fill = createMemo(
    on(
      () => props.counter,
      () => randomColor(0.35),
    ),
  )

  const scale = 2
  return (
    <Arc
      position={{ x: position().x, y: position().y }}
      radius={50 * scale}
      fill={fill()}
      stroke="transparent"
      draggable
      pointerEvents={false}
    >
      <Group position={{ x: 0, y: 25 * scale }}>
        <Arc
          position={{ x: 20 * scale, y: 0 }}
          radius={5 * scale}
          fill="black"
          stroke="transparent"
        />
        <Arc
          position={{ x: 70 * scale, y: 0 }}
          radius={5 * scale}
          fill="black"
          stroke="transparent"
        />
      </Group>
      <Group position={{ x: 0, y: 60 * scale }}>
        <Bezier
          lineCap="round"
          lineWidth={5 * scale}
          stroke="black"
          points={[
            {
              point: { x: 25 * scale, y: 0 },
              control: { x: 0, y: 15 * scale },
            },
            {
              point: { x: 50 * scale, y: 25 * scale },
              control: { x: -15 * scale, y: 0 },
            },
            {
              point: { x: 75 * scale, y: 0 },
              control: { x: 0, y: 15 * scale },
            },
          ]}
        />
      </Group>
    </Arc>
  )
}

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)
  const increment = () => setCounter(c => c + 1)
  window.addEventListener('keydown', event => {
    if (event.code === 'Space') increment()
  })
  window.addEventListener('resize', event => {
    increment()
  })

  const fill = createMemo(
    on(
      counter,
      () =>
        `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${
          Math.random() * 200
        })`,
    ),
  )

  const clock = createClock()
  clock.start()

  const [cursor, setCursor] = createSignal<{ x: number; y: number }>()

  const reducedCounter = createMemo(() => Math.floor(counter() / 200))

  createEffect(() => console.log(reducedCounter()))

  return (
    <>
      <Canvas
        fill={fill()}
        clock={clock.clock()}
        style={{ width: '100%', height: '100%' }}
        alpha
        feedback
        cursor="crosshair"
        stats
        onMouseMove={event => {
          setCursor(event.position)
          increment()
        }}
        onFrame={() => increment()}
      >
        <Show when={cursor()}>
          <Smiley counter={reducedCounter()} position={cursor()!} />
        </Show>
      </Canvas>
    </>
  )
}

export default App
