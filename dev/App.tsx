import { Component, createSignal, Show } from 'solid-js'
import { Canvas, Group, Quadratic, QuadraticPoints } from 'src'
import { Position } from 'src/types'

const App: Component = () => {
  const [points, setPoints] = createSignal<QuadraticPoints | undefined>()
  const randomPoints = () =>
    setPoints([
      {
        point: { x: 10, y: 80 },
      },
      {
        point: { x: 150 + Math.random() * 200, y: Math.random() * 100 - 50 },
        control: { x: -90 + Math.random() * 100 - 50, y: -70 + Math.random() * 100 - 50 },
      },
      {
        point: { x: 150 + Math.random() * 200, y: Math.random() * 100 - 50 },
      },
      {
        point: { x: 150 + Math.random() * 200, y: Math.random() * 100 - 50 },
      },
      {
        point: { x: 150 + Math.random() * 200, y: Math.random() * 100 - 50 },
      },
    ])
  randomPoints()
  return (
    <>
      <div>
        <button onclick={() => randomPoints()}>randomize</button>
      </div>
      <Canvas style={{ width: '100vw', height: '100vh' }} alpha stats draggable debug>
        <Group position={{ x: 500, y: 150 }}>
          <Show when={points()}>
            <Quadratic
              points={points()!}
              position={{ x: 0, y: 150 }}
              lineWidth={2}
              stroke="blue"
              rotation={0}
              draggable
              close
            />
          </Show>
        </Group>
      </Canvas>
    </>
  )
}

export default App
