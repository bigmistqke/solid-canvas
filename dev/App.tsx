import { Component } from 'solid-js'
import { Bezier, Canvas, Group, Line, Quadratic, Text, useClock } from 'src'
import { Composite } from 'src/types'

const randomColor = (alpha?: number) => ({
  h: Math.random() * 360,
  s: 50,
  l: 50,
  a: alpha ?? 0.5,
})

const fxs: {
  filter?: string
  alpha: number
  composite?: Composite
  offset?: { x: number; y: number } | (() => { x: number; y: number })
  double?: boolean
}[] = [
  {
    filter: ``,
    alpha: 0.9,
    composite: 'source-over',
  },
  {
    filter: `hue-rotate(10deg) brightness(101%)`,
    alpha: 0.1,
    composite: 'source-over',
    offset: {
      x: 2,
      y: 2,
    },
  },
  {
    alpha: 0.1,
    offset: {
      x: 0,
      y: -5,
    },
    composite: 'lighten',
  },
  {
    alpha: 0.75,
    offset: () => ({
      x: -1 * Math.sin(performance.now() / 5000),
      y: -1 * Math.cos(performance.now() / 5000),
    }),
    composite: 'source-over',
    double: true,
  },
]

const clock = useClock()
clock.start()

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        alpha
        draggable
        origin={{ x: 200, y: 0 }}
      >
        {/*  <Line
          position={{ x: 400, y: 200 }}
          points={[
            { x: 0, y: 100 },
            { x: 100, y: 200 },
            { x: 200, y: 100 },
          ]}
          draggable
          fill="black"
          editable
        /> */}
        <Group position={{ x: 100, y: 100 }}>
          <Bezier
            points={[
              { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
              {
                point: { x: 100, y: 100 },
                control: { x: -50, y: 0 },
                oppositeControl: { x: 50, y: 0 },
              },
              { point: { x: 200, y: 0 }, control: { x: 0, y: 50 } },
            ]}
            editable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="cubic bezier with oppositeControl manually defined"
            />
          </Bezier>
          <Bezier
            position={{ x: 0, y: 300 }}
            points={[
              { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
              {
                point: { x: 100, y: 100 },
                control: { x: -50, y: 0 },
              },
              { point: { x: 200, y: 0 }, control: { x: 0, y: 50 } },
            ]}
            editable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="cubic bezier with oppositeControl automatically defined"
            />
          </Bezier>
        </Group>
        <Group position={{ x: 500, y: 100 }}>
          <Quadratic
            points={[
              { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
              { point: { x: 100, y: 100 }, control: { x: 50, y: 0 } },
              { point: { x: 200, y: 0 } },
            ]}
            editable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="quadratic bezier with control manually defined"
            />
          </Quadratic>
          <Quadratic
            position={{ x: 0, y: 300 }}
            points={[
              { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
              { point: { x: 100, y: 100 } },
              { point: { x: 200, y: 0 } },
              { point: { x: 400, y: 100 } },
            ]}
            editable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="quadratic bezier with control automatically defined"
            />
          </Quadratic>
        </Group>
      </Canvas>
    </>
  )
}

export default App
