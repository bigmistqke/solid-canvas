<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-canvas&background=tiles&project=%20" alt="solid-canvas">
</p>

# 🎨 solid-canvas

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

a solid wrapper around the `Canvas` API

https://user-images.githubusercontent.com/10504064/226027716-6c1653bb-9db9-43ef-9da5-43452530c495.mp4

```tsx
import { Canvas, Text, Rectangle } from 'solid-canvas'

const App: Component = () => {
  return (
    <Canvas fill="yellow">
      <Text position={{ x: 100, y: 100 }} text="hallo" fill="white" />
      <Rectangle
        position={{ x: 100, y: 100 }}
        dimensions={{ width: 50, height: 50 }}
        stroke="black"
        lineWidth={10}
      />
    </Canvas>
  )
}
```

- MouseEvents: draggable rectangle

```tsx
import { Canvas, Rectangle } from 'solid-canvas'

const App: Component = () => {
  const [selected, setSelected] = createSignal(false)
  const [position, setPosition] = createSignal({ width: 100, height: 100 })

  return (
    <Canvas
      onMouseMove={event => {
        if (!selected()) return
        setPosition(position => ({
          x: position + event.delta.x,
          y: position + event.delta.y,
        }))
      }}
      onMouseUp={() => setSelected(false)}
    >
      <Rectangle
        position={position()}
        dimensions={{ width: 50, height: 50 }}
        onMouseDown={() => setSelected(true)}
      />
    </Canvas>
  )
}
```

Each `Shape` also has a `draggable`-prop:

```tsx
import { Canvas, Rectangle } from 'solid-canvas'

const App: Component = () => {
  return (
    <Canvas>
      <Rectangle dimensions={{ width: 50, height: 50 }} draggable />
    </Canvas>
  )
}
```

- Group and Crop

```tsx
import { Canvas, Rectangle, Group } from 'solid-canvas'

const App: Component = () => {
  return (
    <Canvas>
      <Group
        position={{ x: 100, y: 100 }}
        clip={
          <>
            <Rectangle
              position={{ x: 0, y: 25 }}
              dimensions={{ width: 100, height: 50 }}
              onMouseDown={() => setSelected(true)}
            />
            <Rectangle
              position={{ x: 25, y: 0 }}
              dimensions={{ width: 50, height: 100 }}
              onMouseDown={() => setSelected(true)}
            />
          </>
        }
      >
        <Text text="hallo" />
      </Group>
    </Canvas>
  )
}
```

- Gradient

```tsx
import { Canvas, Rectangle, Gradient } from 'solid-canvas'

const App: Component = () => {
  return (
    <Canvas>
      <Rectangle
        position={{ x:0, y: 25 }}
        dimensions={{ width: 100, height: 50 }}
        onMouseDown={() => setSelected(true)}
        fill={
          <Gradient
            type="conic"
            start={{ x: 0, y: 0 }}
            end={{ x: 100, y: 100 }}
            stops={[
              { offset: 0, color: "white" },
              { offset: 1, color: "black" }
            ]}
          >
        }
      />
    </Canvas>
  )
}
```

## Canvas API-coverage

- [x] Path2D
  - [x] Rectangle
  - [x] Line
  - [x] Arc
  - [x] Bezier
  - [x] Quadratic
- [x] Text
- [x] Group (with `clip`-prop)
- [x] Image
- [ ] ImageData
- [ ] Compositing
  - [x] Path2D
  - [ ] Group
- [x] Color (for fill/stroke)
  - [x] Gradient
  - [x] Pattern

## additional API

- [ ] Layer: component to divide scene up into multiple canvases for optimization
- [x] Draggable-prop for Shape
- [ ] Controller-prop: callback which can control the props
- [ ] Editable-prop for Path2D: handles to manipulate the path
