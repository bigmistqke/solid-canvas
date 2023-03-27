import { Component, createSignal, For } from 'solid-js'
import { Canvas, Rectangle } from 'src'

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)

  setInterval(() => setCounter(c => c + 1), 100)

  const [selected, setSelected] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 200, y: 100 })
  const [moveOrigin, setMoveOrigin] = createSignal(false)
  const [origin, setOrigin] = createSignal({ x: 0, y: 0 })

  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        onMouseDown={e => {
          if (e.target.length === 0) {
            setSelected(false)
            setMoveOrigin(true)
          }
        }}
        onMouseMove={e => {
          if (selected()) {
            setPosition(pos => ({ x: pos.x + e.delta.x, y: pos.y + e.delta.y }))
          } else if (moveOrigin()) {
            setOrigin(pos => ({ x: pos.x + e.delta.x, y: pos.y + e.delta.y }))
          }
        }}
        onMouseUp={() => {
          setSelected(false)
          setMoveOrigin(false)
        }}
        alpha
        stats
        draggable
      >
        <For
          each={new Array(100).fill('').map(v => ({
            position: {
              x: Math.random() * (window.innerWidth + 200) - 100,
              y: Math.random() * (window.innerHeight + 200) - 100,
            },
            fill: {
              r: Math.random() * 215,
              g: Math.random() * 215,
              b: Math.random() * 215,
            },
            skewY: Math.random() * 90,
          }))}
        >
          {data => (
            <Rectangle
              {...data}
              dimensions={{ width: 100, height: 100 }}
              lineWidth={20}
              stroke="transparent"
              draggable
              composite="hard-light"
            />
          )}
        </For>
      </Canvas>
    </>
  )
}

export default App
