import { Component, createSignal } from 'solid-js'
import { Canvas, Rectangle } from '../src'

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)

  setInterval(() => setCounter(c => c + 1), 100)

  const [selected, setSelected] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 200, y: 100 })

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      onMouseDown={e => {
        if (e.target.length === 0) setSelected(false)
      }}
      onMouseMove={e => {
        if (selected()) {
          setPosition(pos => ({ x: pos.x + e.delta.x, y: pos.y + e.delta.y }))
        }
      }}
    >
      <Rectangle
        onMouseDown={event => {
          setSelected(true)
          // event.stopPropagation()
        }}
        onMouseUp={event => {
          setSelected(false)
          // event.stopPropagation()
        }}
        position={position()}
        dimensions={{ width: 100, height: 100 }}
        lineWidth={20}
        fill={selected() ? 'yellow' : 'transparent'}
      />
      {/*  <Line
        points={[
          { x: 0, y: 0 },
          { x: 100, y: 500 },
          { x: 100 + counter() * 10, y: counter() * 10 },
        ]}
        dash={[50, 20]}
        stroke={{ r: 100, b: 0, g: 0 }}
        fill="lightgrey"
        lineWidth={10}
      /> */}
      {/* <Arc position={{ x: 200, y: 100 }} radius={20} fill="red" /> */}
    </Canvas>
  )
}

export default App
