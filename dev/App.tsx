import { Component, createSignal, For } from 'solid-js'
import { Arc, Bezier, Canvas, Group, Line, Quadratic, Rectangle } from 'src'

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
        debug
      >
        <Group position={{ x: 100, y: 100 }}>
          <Arc stroke="yellow" draggable position={{ x: 100, y: 100 }} radius={20} fill="red" />

          <Quadratic
            points={[
              {
                point: { x: 100, y: 250 },
              },
              {
                point: { x: 400, y: 250 },
                control: { x: 432, y: 102 },
              },
              {
                point: { x: 500, y: 350 },
                control: { x: 550, y: 500 },
              },
              {
                point: { x: 100, y: 450 },
              },
            ]}
            position={{ x: 300, y: 0 }}
            lineWidth={20}
            stroke="red"
            rotation={5}
            draggable
          />

          <Bezier
            points={[
              {
                point: { x: 100, y: 250 },
                control: { x: 150, y: -20 },
              },
              {
                point: { x: 400, y: 250 },
                control: { x: 432, y: 102 },
              },
              {
                point: { x: 500, y: 350 },
                control: { x: 450, y: 102 },
              },
              {
                point: { x: 100, y: 450 },
                control: { x: 150, y: 300 },
              },
            ]}
            lineWidth={20}
            stroke="red"
            fill="blue"
            rotation={5}
            draggable
          />
          <Line
            points={[
              { x: 50, y: 100 },
              { x: 200, y: 0 },
              { x: 150, y: 250 },
              { x: 50, y: 150 },
            ]}
            position={{
              x: 200,
              y: 200,
            }}
            skewY={10}
            rotation={10}
            lineWidth={1}
            stroke="red"
          />
          <Rectangle
            stroke="yellow"
            dimensions={{ width: 100, height: 100 }}
            lineWidth={20}
            draggable
            rotation={20}
          />
        </Group>
      </Canvas>
    </>
  )
}

export default App
