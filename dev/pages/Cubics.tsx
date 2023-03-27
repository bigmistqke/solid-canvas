import { Component, createMemo, createSignal, For, on, Show } from 'solid-js'
import { Bezier, Canvas, Group, Quadratic, QuadraticPoints } from 'src'

const RandomBezier = (props: { counter: number; scale: number }) => {
  const getPoints = () => {
    const points = []
    let i = 0
    const amount = 10
    const variation = 500
    while (i <= amount) {
      const point =
        i === 0 || i === amount
          ? {
              x: (i * window.innerWidth) / amount,
              y: window.innerHeight,
            }
          : {
              x: (i * window.innerWidth) / amount,
              y:
                i % 2 === 0
                  ? window.innerHeight / 2 +
                    Math.random() * variation -
                    variation / 2
                  : window.innerHeight / 3 -
                    (window.innerHeight / 3) * props.scale +
                    Math.random() * variation,
            }
      const control =
        i === 0 || i === amount
          ? {
              x: 0,
              y: -50,
            }
          : {
              x: -50,
              y: 0,
            }
      points.push({
        point,
        control,
      })
      i++
    }
    return points
  }

  const points = createMemo(
    on(
      () => props.counter,
      () => getPoints(),
    ),
  )

  const randomFill = createMemo(
    on(
      () => props.counter,
      () => {
        return {
          r: Math.random() * 200,
          g: Math.random() * 200,
          b: Math.random() * 200,
        }
      },
    ),
  )

  return (
    <Bezier
      points={points()!}
      lineWidth={2}
      stroke="transparent"
      fill={randomFill()}
      close
      composite={'hard-light'}
    />
  )
}

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)
  const [debug, setDebug] = createSignal(false)
  const increment = () => setCounter(c => c + 1)
  window.addEventListener('keydown', event => {
    if (event.code === 'Space') increment()
  })
  window.addEventListener('resize', event => {
    increment()
  })
  const amount = 20

  const randomFill = createMemo(
    on(counter, () => {
      return `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${
        Math.random() * 200
      })`
    }),
  )
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%', background: randomFill() }}
        alpha
        stats
        onMouseDown={increment}
        debug={debug()}
      >
        <Group position={{ x: 0, y: 0 }}>
          <For each={new Array(amount).fill('')}>
            {(_, i) => (
              <RandomBezier
                counter={counter()}
                scale={(amount - i()) / amount}
              />
            )}
          </For>
        </Group>
      </Canvas>
    </>
  )
}

export default App
