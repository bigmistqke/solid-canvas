import { Component, createMemo, createSignal, For, on, Show } from 'solid-js'
import { Canvas, Group, Quadratic, QuadraticPoints } from 'src'

const RandomBezier = (props: { counter: number }) => {
  const randomPoints = createMemo(
    on(
      () => props.counter,
      (): QuadraticPoints => [
        {
          point: { x: 10, y: 80 },
        },
        {
          point: { x: 150 + Math.random() * 75, y: Math.random() * 75 - 37 },
          control: {
            x: -90 + Math.random() * 75 - 25,
            y: -70 + Math.random() * 75 - 25,
          },
        },
        {
          point: { x: 150 + Math.random() * 75, y: Math.random() * 75 - 25 },
        },
        {
          point: { x: 150 + Math.random() * 75, y: Math.random() * 75 - 25 },
        },
        {
          point: { x: 150 + Math.random() * 75, y: Math.random() * 750 - 25 },
        },
      ],
    ),
  )
  const points = createMemo(randomPoints)

  const randomFill = createMemo(() => {
    return {
      r: Math.random() * 200,
      g: Math.random() * 200,
      b: Math.random() * 200,
    }
  })

  const randomComposite = createMemo(() => {
    const dice = Math.random()
    if (dice < 0.2) return 'soft-light'
    if (dice < 0.4) return 'hard-light'
    if (dice < 0.6) return 'lighter'
    if (dice < 0.8) return 'exclusion'
    return 'darken'
  })

  const randomPosition = createMemo(
    on(
      () => props.counter,
      () => ({
        x: Math.random() * window.innerWidth - window.innerWidth / 2,
        y: Math.random() * window.innerHeight - window.innerHeight / 2,
      }),
    ),
  )
  return (
    <Quadratic
      points={points()!}
      position={randomPosition()}
      lineWidth={2}
      stroke="transparent"
      fill={randomFill()}
      draggable
      close
      composite={randomComposite()}
    />
  )
}

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)
  const [debug, setDebug] = createSignal(true)
  const increment = () => setCounter(c => c + 1)
  window.addEventListener('keydown', event => {
    if (event.code === 'Space') increment()
  })
  return (
    <>
      <div
        style={{
          position: 'fixed',
          'z-index': 2,
          padding: '5px',
          left: '5px',
          top: '5px',
        }}
      >
        <button onClick={() => setDebug(d => !d)}>
          debug {debug() ? 'off' : 'on'}
        </button>
      </div>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        alpha
        stats
        draggable
        debug={debug()}
      >
        <Group position={{ x: 500, y: 150 }}>
          <For each={new Array(20).fill('')}>
            {() => <RandomBezier counter={counter()} />}
          </For>
        </Group>
      </Canvas>
    </>
  )
}

export default App
