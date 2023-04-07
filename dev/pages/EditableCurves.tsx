import { Component } from 'solid-js'
import { Bezier, Canvas, Group, Quadratic, Text } from 'src'
import { Drag } from 'src/controllers/Drag'
import { CubicHandle, QuadraticHandle } from 'src/controllers/Handle'

const App: Component = () => (
  <Canvas
    style={{ width: '100%', height: '100%' }}
    alpha
    draggable
    transform={{ position: { x: 200, y: 0 } }}
  >
    <Group
      transform={{
        position: { x: 100, y: 100 },
      }}
    >
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
        style={{
          stroke: 'black',
        }}
        controllers={[Drag(), CubicHandle()]}
      >
        <Text
          transform={{
            position: { x: 0, y: -40 },
          }}
          text="cubic bezier with oppositeControl manually defined"
        />
      </Bezier>
      <Bezier
        transform={{
          position: { x: 0, y: 300 },
        }}
        style={{
          '&:hover': {
            stroke: 'blue',
          },
        }}
        points={[
          { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
          {
            point: { x: 100, y: 100 },
            control: { x: -50, y: 0 },
          },
          { point: { x: 200, y: 0 }, control: { x: 0, y: 50 } },
        ]}
        controllers={[Drag(), CubicHandle()]}
      >
        <Text
          transform={{
            position: { x: 0, y: -40 },
          }}
          style={{
            '&:hover': {
              fill: 'blue',
            },
          }}
          text="cubic bezier with oppositeControl automatically defined"
        />
      </Bezier>
    </Group>
    <Group
      transform={{
        position: { x: 500, y: 100 },
      }}
    >
      <Quadratic
        points={[
          { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
          { point: { x: 100, y: 100 }, control: { x: 50, y: 0 } },
          { point: { x: 200, y: 0 } },
        ]}
        hoverStyle={{
          stroke: 'green',
        }}
        controllers={[Drag(), QuadraticHandle()]}
      >
        <Text
          transform={{
            position: { x: 0, y: -40 },
          }}
          text="quadratic bezier with control manually defined"
          hoverStyle={{
            fill: 'green',
          }}
        />
      </Quadratic>
      <Quadratic
        transform={{
          position: { x: 0, y: 300 },
        }}
        style={{
          '&:hover': {
            stroke: 'red',
          },
        }}
        points={[
          { point: { x: 0, y: 0 }, control: { x: 0, y: 50 } },
          { point: { x: 100, y: 100 } },
          { point: { x: 200, y: 0 } },
          { point: { x: 400, y: 100 } },
        ]}
        controllers={[Drag(), QuadraticHandle()]}
      >
        <Text
          transform={{
            position: { x: 0, y: -40 },
          }}
          text="quadratic bezier with control automatically defined"
          hoverStyle={{
            fill: 'red',
          }}
        />
      </Quadratic>
    </Group>
  </Canvas>
)

export default App
