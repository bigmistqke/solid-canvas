import { Component } from 'solid-js'
import { Canvas, Path } from 'src'
import { createLine } from 'src/d/d'

const App: Component = () => (
  <Canvas
    style={{ width: '100%', height: '100%' }}
    alpha
    draggable
    transform={{
      position: { x: 200, y: 0 },
    }}
  >
    <Path
      transform={{
        position: { x: 100, y: 100 },
      }}
      d={createLine([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])
        .toQuadratic([
          { point: { x: 300, y: 400 } },
          { point: { x: 500, y: 300 } },
        ])
        .toCubic([
          {
            point: { x: 300, y: 400 },
            control: { x: 50, y: -50 },
          },
          {
            point: { x: 500, y: 300 },
            control: { x: 0, y: -50 },
          },
        ])
        .to({ x: 0, y: 100 })
        .toLine({ x: 250, y: 50 })}
    />
  </Canvas>
)

export default App
