import { Component } from 'solid-js'
import { Bezier, Canvas, Group, Quadratic, Text } from 'src'
import { Drag } from 'src/controllers/Drag'

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        alpha
        draggable
        origin={{ x: 200, y: 0 }}
      >
        <Bezier
          position={{ x: 100, y: 100 }}
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
          controllers={[
            Drag({
              active: true,
              onDragMove: position => console.log('dragging', position),
            }),
          ]}
        />
        <Bezier
          position={{ x: 100, y: 500 }}
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
          controllers={[Drag({ active: true })]}
        />
        <Group>
          <Bezier
            position={{ x: 300, y: 500 }}
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
            controllers={[Drag({ active: true })]}
          />
        </Group>
      </Canvas>
    </>
  )
}

export default App
