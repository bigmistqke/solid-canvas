import { Component, createEffect, createMemo, createSignal, For, on } from 'solid-js'
import { Arc, Bezier, Canvas, Group, useCanvas, useClock } from 'src'

const Smiley = () => {
  const context = useCanvas()
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  const randomPosition = {
    x: Math.random() * (window.innerWidth + 100) - 50,
    y: Math.random() * (window.innerHeight + 100) - 50,
  }
  const delta = Math.random() * 10 + 20

  const color = createMemo(() => ({ h: Math.random() * 360, s: 50, l: 50 }))

  context?.onFrame(() => {
    setPosition({
      x: randomPosition.x + Math.sin(performance.now() / (20 * delta) + delta) * 20,
      y: randomPosition.y + Math.cos(performance.now() / (20 * delta) + delta) * 20,
    })
  })
  return (
    <Arc
      position={{ x: position().x, y: position().y }}
      radius={50}
      fill={color()}
      stroke="transparent"
      draggable
    >
      <Group position={{ x: 0, y: 25 }}>
        <Arc position={{ x: 20, y: 0 }} radius={5} fill="black" />
        <Arc position={{ x: 70, y: 0 }} radius={5} fill="black" />
      </Group>
      <Group position={{ x: 0, y: 60 }}>
        <Bezier
          lineWidth={5}
          // shadow={{ blur: 0, offset: { x: 5, y: 5 }, color: 'black' }}
          points={[
            { point: { x: 25, y: 0 }, control: { x: 0, y: 15 } },
            { point: { x: 50, y: 25 }, control: { x: -15, y: 0 } },
            { point: { x: 75, y: 0 }, control: { x: 0, y: 15 } },
          ]}
        />
      </Group>
    </Arc>
  )
}

const App: Component = () => {
  const fill = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`

  const clock = useClock()
  clock.start()
  return (
    <>
      <Canvas clock={clock.clock()} style={{ width: '100%', height: '100%', fill }} alpha stats>
        {/* <For each={new Array(10).fill('')}>{() => <Smiley />}</For> */}
        <Smiley />
        {/* <Bezier
          lineWidth={5}

          // shadow={{ blur: 0, offset: { x: 5, y: 5 }, color: 'black' }}
          points={[
            { point: { x: 25, y: 0 }, control: { x: 0, y: 15 } },
            { point: { x: 50, y: 25 }, control: { x: -15, y: 0 } },
            { point: { x: 75, y: 0 }, control: { x: 0, y: 15 } },
          ]}
        /> */}
      </Canvas>
    </>
  )
}

export default App
