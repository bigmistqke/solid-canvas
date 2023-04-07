import { Component, For } from 'solid-js'
import { Canvas, createClock, Rectangle } from 'src'
import { Drag } from 'src/controllers/Drag'

const App: Component = () => {
  const randoms = new Array(100).fill('').map(v => ({
    x: Math.random() * (window.innerWidth + 200),
    y: Math.random() * (window.innerHeight + 200),
  }))

  const clock = createClock()
  clock.start()

  return (
    <>
      <Canvas
        // clock={clock.clock()}
        style={{ width: '100vw', height: '100vh' }}
        alpha
        stats
        draggable
      >
        <For
          each={new Array(400).fill('').map((v, i) => ({
            transform: {
              position: {
                x: Math.random() * (window.innerWidth + 200) - 100,
                y: Math.random() * (window.innerHeight + 200) - 100,
              },
              skew: {
                y: Math.random() * 90,
              },
            },
            style: {
              fill: {
                r: Math.random() * 215,
                g: Math.random() * 215,
                b: Math.random() * 215,
              },
            },
          }))}
        >
          {(data, i) => (
            <Rectangle
              transform={data.transform}
              style={{
                ...data.style,
                dimensions: { width: 100, height: 100 },
                lineWidth: 20,
                stroke: undefined,
                composite: 'soft-light',
                '&:hover': {
                  fill: 'black',
                },
              }}
              controllers={[Drag()]}
            />
          )}
        </For>
      </Canvas>
    </>
  )
}

export default App
