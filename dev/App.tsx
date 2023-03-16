import { Component, createSignal } from 'solid-js'
import { Canvas, Gradient, Group, Rectangle, Text, Image } from 'src'

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
        alpha={true}
        // fill="yellow"
        // origin={origin()}
      >
        <Rectangle
          dimensions={{ width: 500, height: 500 }}
          fill={{ r: 50, g: 200, b: 100 }}
          stroke="transparent"
          lineWidth={20}
          skewY={-20}
          composite="difference"
          draggable
        />
        <Image
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/NBSFirstScanImage.jpg/840px-NBSFirstScanImage.jpg"
          dimensions={{
            width: 100,
            height: 100,
          }}
          onMouseDown={() => console.log('clicked')}
          draggable
        />
        {/* <Group
          position={{ x: 100, y: 100 }}
          clip={
            <>
              <Rectangle dimensions={{ width: 500, height: 500 }} />
              <Rectangle dimensions={{ width: 500, height: 500 }} skewX={20} />
            </>
          }
        >
         

          <Rectangle
            // onMouseDown={() => setSelected(true)}
            dimensions={{ width: 500, height: 500 }}
            lineWidth={20}
            draggable
            fill="blue"
            skewY={10}
          />
        </Group> */}
      </Canvas>
    </>
  )
}

export default App
