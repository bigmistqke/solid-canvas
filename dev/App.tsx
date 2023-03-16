import { Component, createSignal } from 'solid-js'
import { Canvas, Gradient, Group, Rectangle, Text } from 'src'

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
        alpha={false}
        background="yellow"
        // origin={origin()}
      >
        <Text
          onMouseDown={() => {
            console.log('CLICKED!')
            setSelected(true)
          }}
          text="hallo"
          stroke="black"
          background="red"
          position={{ x: 100, y: 100 }}
        />
        <Rectangle position={{ x: 100, y: 100 }} dimensions={{ width: 10, height: 10 }} />
        {/* <Group position={{ x: 100, y: 100 }}>
          <Text
            onMouseDown={() => {
              console.log('CLICKED!')
              setSelected(true)
            }}
            text="hallo"
            stroke="black"
            background="red"
          />
          <Rectangle
            onMouseDown={() => setSelected(true)}
            dimensions={{ width: 500, height: 500 }}
            lineWidth={20}
            stroke={
              <Gradient
                type="linear"
                start={{ x: window.innerWidth, y: 0 }}
                end={{ x: 0, y: window.innerHeight }}
                stops={[
                  { offset: 0, color: 'red' },
                  { offset: 1, color: 'blue' },
                ]}
              />
            }
            fill={
              <Gradient
                type="conic"
                center={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
                startAngle={10}
                end={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
                stops={[
                  { offset: 0, color: 'red' },
                  { offset: 1, color: 'blue' },
                ]}
              />
            }
            skewY={10}
          />
        </Group> */}
      </Canvas>
    </>
  )
}

export default App
