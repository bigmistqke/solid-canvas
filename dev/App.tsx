import { Component } from 'solid-js'
import { Bezier, Canvas, Group, Quadratic, Text } from 'src'

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        alpha
        draggable
        origin={{ x: 200, y: 0 }}
      >
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
            hoverStyle={{
              stroke: 'yellow',
            }}
            editable
            draggable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="cubic bezier with oppositeControl manually defined"
              hoverStyle={{
                fill: 'yellow',
              }}
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
            hoverStyle={{
              stroke: 'blue',
            }}
            editable
            draggable
          >
            <Text
              position={{ x: 0, y: -40 }}
              hoverStyle={{
                fill: 'blue',
              }}
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
            hoverStyle={{
              stroke: 'green',
            }}
            editable
            draggable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="quadratic bezier with control manually defined"
              hoverStyle={{
                fill: 'green',
              }}
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
            hoverStyle={{
              stroke: 'red',
            }}
            editable
            draggable
          >
            <Text
              position={{ x: 0, y: -40 }}
              text="quadratic bezier with control automatically defined"
              hoverStyle={{
                fill: 'red',
              }}
            />
          </Quadratic>
        </Group>
      </Canvas>
    </>
  )
}

export default App
