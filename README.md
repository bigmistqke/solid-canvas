<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-canvas&background=tiles&project=%20" alt="solid-canvas">
</p>

# solid-canvas

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

a solid wrapper around the `Canvas` API

## Quick start

Use it:

- simple example

```tsx
import solid-canvas from 'solid-canvas'

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        fill="yellow"
      >
        <Text
          position={{x: 100, y: 100}}
          text="hallo"
          fill="white"
        />
        <Rectangle
          position={{x: 100, y: 100}}
          dimensions={{ width: 50, height: 50 }}
          stroke="black"
          lineWidth={10}
        />
      </Canvas>
    </>
  )
}
```

- MouseEvents: draggable rectangle

```tsx
import solid-canvas from 'solid-canvas'

const App: Component = () => {

  const [selected, setSelected] = createSignal(false);
  const [position, setPosition] = createSignal({ width: 100, height: 100 });

  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        onMouseMove={(event) => {
          if(!selected()) return
          setPosition(position => ({
            x: position + event.delta.x,
            y: position + event.delta.y
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
    </>
  )
}
```

- Group and Crop

```tsx
import solid-canvas from 'solid-canvas'

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        fill="yellow"
      >
        <Group
          position={{x: 100, y: 100}}
          clip={
            <>
              <Rectangle
                position={{x:0, y: 25}}
                dimensions={{ width: 100, height: 50 }}
                onMouseDown={() => setSelected(true)}
              />
              <Rectangle
                position={{x:25, y: 0}}
                dimensions={{ width: 50, height: 100 }}
                onMouseDown={() => setSelected(true)}
              />
            </>
          }
        >
          <Text text="hallo" />
        </Group>
      </Canvas>
    </>
  )
}
```

- Gradient

```tsx
import solid-canvas from 'solid-canvas'

const App: Component = () => {
  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
      >
        <Rectangle
          position={{x:0, y: 25}}
          dimensions={{ width: 100, height: 50 }}
          onMouseDown={() => setSelected(true)}
          fill={
            <Gradient
              type="conic"
              start={{
                x: 0,
                y: 0
              }}
              end={{
                x: 100,
                y: 100
              }}
              stops={[
                {
                  offset: 0,
                  color: "white"
                },
                {
                  offset: 1,
                  color: "black"
                }
              ]}
            >
          }
        />
      </Canvas>
    </>
  )
}
```

## Canvas API-coverage

- [ ] Path2D
  - [x] Rectangle
  - [x] Line
  - [ ] Arc
  - [ ] Bezier
  - [ ] Quadratic
- [x] Text
- [x] Group (with `clip`-prop)
- [ ] Image
- [x] Color (for fill/stroke)
  - [x] Gradient
  - [x] Pattern

## additional API

- [ ] Layer: divide scene up into multiple canvases for optimization
