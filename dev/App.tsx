import { Component, createSignal, For } from 'solid-js'
import { Bezier, Canvas, Group, Line, Rectangle } from 'src'

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
          <Bezier
            points={[
              {
                point: { x: 100, y: 250 },
                control: { x: 100, y: 100 },
              },
              {
                point: { x: 400, y: 250 },
                control: { x: 432, y: 102 },
              },
            ]}
            lineWidth={2}
            stroke="red"
            fill="blue"
            rotation={5}
          />
          <Line
            points={[
              { x: 50, y: 100 },
              { x: 200, y: 0 },
              { x: 150, y: 250 },
              { x: 50, y: 150 },
            ]}
            skewY={10}
            rotation={10}
            lineWidth={1}
            stroke="red"
          />
          {/* <Line
            points={[
              { x: 50, y: 100 },
              { x: 200, y: 0 },
              { x: 150, y: 250 },
              { x: 50, y: 150 },
            ]}
            skewY={10}
            rotation={10}
            lineWidth={1}
            stroke="red"
          /> */}
          {/*
          <Line
            points={[
              { x: 50, y: 100 },
              { x: 200, y: 0 },
              { x: 150, y: 250 },
              { x: 50, y: 150 },
            ]}
            lineWidth={1}
          />
          <Rectangle
            stroke="yellow"
            dimensions={{ width: 100, height: 100 }}
            lineWidth={20}
            draggable
          /> */}
        </Group>
      </Canvas>
    </>
  )
}

export default App
