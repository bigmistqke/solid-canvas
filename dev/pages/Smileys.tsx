import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
} from 'solid-js'
import { Arc, Bezier, Canvas, createClock, Group } from 'src'
import { Drag } from 'src/controllers/Drag'

const Smiley = (props: { counter: number }) => {
  const randomPosition = {
    x: Math.random() * (window.innerWidth + 100) - 50,
    y: Math.random() * (window.innerHeight + 100) - 50,
  }
  const delta = Math.random() * 10 + 20
  const x = createMemo(
    on(
      () => props.counter,
      () =>
        randomPosition.x +
        Math.sin(performance.now() / (20 * delta) + delta) * 20,
    ),
  )
  const y = createMemo(
    on(
      () => props.counter,
      () =>
        randomPosition.y +
        Math.cos(performance.now() / (20 * delta) + delta) * 20,
    ),
  )

  const color = createMemo(() => ({ h: Math.random() * 360, s: 50, l: 50 }))
  return (
    <Arc
      transform={{
        position: {
          get x() {
            return x()
          },
          get y() {
            return y()
          },
        },
      }}
      style={{
        radius: 70,
        fill: color(),
        stroke: false,
      }}
      controllers={[Drag()]}
    >
      <Group transform={{ position: { x: 0, y: 35 } }}>
        <Arc
          transform={{ position: { x: 40, y: 0 } }}
          style={{
            radius: 10,
            fill: 'black',
            stroke: false,
            pointerEvents: true,
            '&:hover': {
              fill: 'red',
            },
          }}
        />
        <Arc
          transform={{ position: { x: 80, y: 0 } }}
          style={{ radius: 10, fill: 'black', stroke: false }}
        />
      </Group>
      <Group transform={{ position: { x: 20, y: 80 } }}>
        <Bezier
          style={{
            lineWidth: 15,
            lineCap: 'round',
            stroke: 'black',
            fill: false,
          }}
          points={[
            { point: { x: 10, y: 0 }, control: { x: 0, y: 20 } },
            { point: { x: 50, y: 40 }, control: { x: -20, y: 0 } },
            { point: { x: 90, y: 0 }, control: { x: 0, y: 20 } },
          ]}
        />
      </Group>
    </Arc>
  )
}

const App: Component = () => {
  const fill = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${
    Math.random() * 200
  })`

  const clock = createClock()
  clock.start(1000 / 30)

  const [amount, setAmount] = createSignal(300)
  const [shouldUseClock, setShouldUseClock] = createSignal(false)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          background: 'white',
          padding: '5px',

          margin: '5px',
          'font-size': '10pt',
          display: 'flex',
          gap: '5px',
          'font-family': 'monospace',
          'flex-direction': 'column',
        }}
      >
        <div style={{ display: 'flex', gap: '5px' }}>
          <label>amount:</label>
          <input
            type="number"
            style={{
              border: 'none',
              width: '50px',
              'font-family': 'monospace',
            }}
            value={amount()}
            onInput={e => setAmount(+e.currentTarget.value)}
            step={10}
          />
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <label style={{ flex: 1 }}>clock:</label>
          <input
            type="checkbox"
            checked={shouldUseClock()}
            onInput={e => setShouldUseClock(e.currentTarget.checked)}
          />
        </div>
      </div>
      <Canvas
        clock={shouldUseClock() ? clock.clock() : undefined}
        style={{ width: '100%', height: '100%', fill }}
        alpha
        stats
      >
        <For each={new Array(amount()).fill('')}>
          {() => <Smiley counter={clock.clock()} />}
        </For>
      </Canvas>
    </>
  )
}

export default App
