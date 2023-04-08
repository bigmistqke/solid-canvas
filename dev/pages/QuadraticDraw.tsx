import { createStore } from 'solid-js/store'
import { Canvas, Quadratic } from 'src'
import { Vector } from 'src/types'

const [path, setPath] = createStore<{ point: Vector; control?: Vector }[]>([])

const App = () => (
  <Canvas
    draggable
    fill="darkgrey"
    onMouseDown={event => {
      setPath(path =>
        path.length === 0
          ? [{ point: event.position, control: { x: -50, y: 0 } }]
          : [...path, { point: event.position }],
      )
    }}
  >
    <Quadratic points={path} editable />
  </Canvas>
)

export default App
