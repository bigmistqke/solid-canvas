import { Component, createSignal, For } from 'solid-js'
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
        alpha
        stats
        // fill="yellow"
        // origin={origin()}
      >
        {/* <Group
          position={{ x: 100, y: 100 }}
          clip={
            <>
              <Rectangle position={{ x: 0, y: 0 }} dimensions={{ width: 500, height: 500 }} />
              <Rectangle dimensions={{ width: 500, height: 500 }} skewX={20} />
            </>
          }
          composite="color-burn"
        > */}
        {/* <Image
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/NBSFirstScanImage.jpg/840px-NBSFirstScanImage.jpg"
          dimensions={{
            width: 100,
            height: 100,
          }}
          onMouseDown={() => console.log('clicked')}
          draggable
        /> */}
        <For
          each={new Array(500).fill('').map(v => ({
            position: {
              x: Math.random() * (window.innerWidth + 200) - 100,
              y: Math.random() * (window.innerHeight + 200) - 100,
            },
            fill: { r: Math.random() * 215, g: Math.random() * 215, b: Math.random() * 215 },
            skewY: Math.random() * 90,
          }))}
        >
          {data => (
            <Rectangle
              // onMouseDown={() => setSelected(true)}
              {...data}
              dimensions={{ width: 100, height: 100 }}
              lineWidth={20}
              stroke="transparent"
              draggable
              composite="hard-light"
            />
          )}
        </For>

        {/* </Group> */}
        {/* <Rectangle
          dimensions={{ width: 500, height: 500 }}
          fill={{ r: 50, g: 200, b: 100 }}
          stroke="transparent"
          position={{ x: Math.random() * 200, y: Math.random() * 200 }}
          lineWidth={20}
          skewY={-20}
          // composite="difference"
          draggable
        /> */}
      </Canvas>
    </>
  )
}

export default App
