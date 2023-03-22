<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-canvas&background=tiles&project=%20" alt="solid-canvas">
</p>

# 🎨 solid-canvas

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

a solid wrapper around the `Canvas` API

https://user-images.githubusercontent.com/10504064/226027716-6c1653bb-9db9-43ef-9da5-43452530c495.mp4

[source](https://github.com/bigmistqke/solid-canvas/blob/main/dev/pages/rectangles.tsx)

https://user-images.githubusercontent.com/10504064/226694280-f2a2976a-ddc5-4025-9e5e-f82ee2ec6622.mp4

[source](https://github.com/bigmistqke/solid-canvas/blob/main/dev/pages/Cubics.tsx)

https://user-images.githubusercontent.com/10504064/226762226-f6dc3759-1cc0-4b8f-9e1a-30aba76aa13f.mp4

[source](https://github.com/bigmistqke/solid-canvas/blob/main/dev/pages/Smileys.tsx)

https://user-images.githubusercontent.com/10504064/226961725-e3b53122-acff-4c3a-84db-ee2d45adf939.mp4

[source](https://github.com/bigmistqke/solid-canvas/blob/main/dev/pages/Feedback.tsx)

### Simple example

```tsx
import { Canvas, Text, Rectangle } from 'solid-canvas'

const App = () => (
  <Canvas fill="blue">
    <Text position={{ x: 100, y: 100 }} text="hallo" fill="white" size={20} />
    <Rectangle
      position={{ x: 100, y: 100 }}
      dimensions={{ width: 250, height: 250 }}
      fill="purple"
      stroke="transparent"
    />
  </Canvas>
)
```

> You can also compose shapes


```tsx
import { Canvas, Text, Rectangle } from 'solid-canvas'

const App = () => (
  <Canvas fill="blue">
    <Rectangle
      position={{ x: 100, y: 100 }}
      dimensions={{ width: 250, height: 250 }}
      fill="purple"
      stroke="transparent"
    >
      <Text text="hallo" fill="white" size={20} />
    </Rectangle>
  </Canvas>
)
```

<img width="1440" alt="Screenshot 2023-03-22 at 20 36 47" src="https://user-images.githubusercontent.com/10504064/227017579-117f41a2-be28-4b4b-8f6b-2781855e6d20.png">


### MouseEvents: draggable `<Rectangle/>`

```tsx
import { Canvas, Rectangle } from 'solid-canvas'

const App: Component = () => {
  const [selected, setSelected] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 100, y: 100 })

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

> Each `Shape` also has a `draggable`-prop:

```tsx
import { Canvas, Rectangle } from 'solid-canvas'

const App = () => (
  <Canvas>
    <Rectangle 
      position={{ x: 100, y: 100 }} 
      dimensions={{ width: 50, height: 50 }} 
      draggable 
    />
  </Canvas>
)
```

https://user-images.githubusercontent.com/10504064/227018274-0a7fb0a5-2189-4bd3-af8b-491522948631.mp4


### `<Group/>` and Clip

```tsx
import { Canvas, Rectangle, Group } from 'solid-canvas'

const App = () => (
  <Canvas>
    <Group
      position={{ x: 100, y: 100 }}
      clip={() => (
        <>
          <Rectangle position={{ x: 0, y: 0 }} dimensions={{ width: 100, height: 50 }} />
          <Rectangle position={{ x: 0, y: 0 }} dimensions={{ width: 50, height: 100 }} />
        </>
      )}
      fill="blue"
    >
      <Text text="hallo" size={50} />
    </Group>
  </Canvas>
)
```

<img width="1440" alt="Screenshot 2023-03-22 at 20 46 40" src="https://user-images.githubusercontent.com/10504064/227019371-6bf31873-a312-4d02-8f3d-2205cd9f024c.png">

> All `Shapes` inherit from `Group`, so you can `clip` and add `children` to any `Shape`

## Lines: `<Line/>`, `<Bezier/>` and `<Quadratic/>`

```tsx
import { Bezier, Canvas, Line, Quadratic } from 'solid-canvas'

const App = () => (
  <Canvas>
    <Line
      position={{ x: 100, y: 200 }}
      points={[
        { x: 0, y: 100 },
        { x: 50, y: 200 },
        { x: 100, y: 100 },
        { x: 150, y: 200 },
        { x: 200, y: 100 },
        { x: 250, y: 200 },
      ]}
    />
    <Bezier
      position={{ x: 500, y: 200 }}
      points={[
        { point: { x: 0, y: 100 }, control: { x: 50, y: 0 } },
        { point: { x: 50, y: 200 }, control: { x: -50, y: 0 } },
        { point: { x: 100, y: 100 }, control: { x: -50, y: 0 } },
        { point: { x: 150, y: 200 }, control: { x: -50, y: 0 } },
        { point: { x: 200, y: 100 }, control: { x: -50, y: 0 } },
        { point: { x: 250, y: 200 }, control: { x: -50, y: 0 } },
      ]}
    />
    <Quadratic
      position={{ x: 900, y: 200 }}
      points={[
        { point: { x: 0, y: 100 } },
        { point: { x: 50, y: 200 }, control: { x: -25, y: 0 } },
        { point: { x: 100, y: 100 } },
        { point: { x: 150, y: 200 } },
        { point: { x: 200, y: 100 } },
        { point: { x: 250, y: 200 } },
      ]}
    />
  </Canvas>
)
```

<img width="1440" alt="Screenshot 2023-03-22 at 21 25 52" src="https://user-images.githubusercontent.com/10504064/227030059-a5b152b8-9d2d-42f8-a894-7e1462624426.png">


## Canvas API-Coverage

- [ ] Shape
  - [x] Path2D
    - [x] `<Rectangle/>`
    - [x] `<Line/>`
    - [x] `<Arc/>`
    - [x] `<Bezier/>`
    - [x] `<Quadratic/>`
  - [x] `<Text/>`
  - [x] `<Image/>`
  - [ ] `<ImageData/>`
- [x] `<Group/>`
- [ ] Compositing
  - [ ] `<Group/>`
  - [x] Shape
- [x] Clipping
  - [x] `<Group/>`
  - [x] Shape (Shape inherits from `Group`)
- [x] Color (for fill/stroke)
  - [x] `<Gradient/>`
  - [x] `<Pattern/>`

## Additional API

- [ ] nestable `<Canvas/>` to divide scene up for optimization (p.ex static background-canvas and dynamic player-canvas)
- [x] Draggable-prop for Shape and Canvas
- [ ] Controller-prop: callback which can control the props
- [ ] Editable-prop for Path2D: handles to manipulate the path
- [ ] OffscreenCanvas / Offscreen-prop: offload rendering to webworker
- [ ] `SVG` component: render svg path-strings (path's `d`-attribute)
- [ ] masking with `destination-in` [see](https://stackoverflow.com/a/25531787/4366929)

## Overal Ambitions / Roadmap

- Cover the whole Canvas-API
- Provide tools to simplify common canvas operations:
  - [ ] Navigation
    - [x] Pan 👉 `Canvas.draggable`
    - [ ] Zoom
  - [x] MouseEvents for `Shape` 👉 `Shape.onMouseDown`, `Shape.onMouseMove` and `Shape.onMouseUp`
  - [x] MouseEvents for `Canvas` 👉 `Canvas.onMouseDown`, `Canvas.onMouseMove` and `Canvas.onMouseUp`
  - [ ] HoverStyles for `Shape`
  - [x] Draggable `Shape` 👉 `Shape.draggable`
  - [ ] Editable `Path2D` with handlers
  - [ ] Possibility to add behaviors to `Shapes` in a composable way (character-controllers)
- explore render-optimizations:
  - only render what is in viewport
  - only render the bounds of Shapes that has changed
- After the initial exploration in the feature-set, I want to explore tactics to improve treeshakeability of the library: a simple static visualization should be able to have a minimal bundle.
