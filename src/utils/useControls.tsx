import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor, createSignal, For, JSX, on } from 'solid-js'
import { Arc, Group, Line } from 'src'
import { GroupToken } from 'src/parser'
import { CanvasMouseEvent, Position, Shape2DProps } from 'src/types'
import addVectors from './addVectors'

const ControlPoint = (props: {
  onDragMove: (position: Position) => void
  onMouseDown?: (event: CanvasMouseEvent) => void
  position: Position
  children?: JSX.Element | JSX.Element[]
}) => (
  <Arc
    onDragMove={props.onDragMove}
    radius={6}
    fill="black"
    position={{ x: props.position.x - 6, y: props.position.y - 6 }}
    draggable
    onMouseDown={props.onMouseDown}
  >
    {props.children}
  </Arc>
)
type ControlledPoint = { point: Position; control?: Position; oppositeControl?: Position }

export default function <T extends Position | ControlledPoint>(props: {
  points: T[]
  controls?: boolean | undefined
}) {
  const [offsets, setOffsets] = createSignal<T[]>(
    props.points.map(v =>
      'x' in v
        ? { x: 0, y: 0 }
        : 'oppositeControl' in v
        ? { control: { x: 0, y: 0 }, oppositeControl: { x: 0, y: 0 }, point: { x: 0, y: 0 } }
        : { control: { x: 0, y: 0 }, point: { x: 0, y: 0 } },
    ) as T[],
  )

  const controls = (
    <Group>
      <For each={props.points}>
        {(value, i) => {
          if ('x' in value) {
            return (
              <ControlPoint
                onDragMove={dragPosition => {
                  setOffsets(offsets => {
                    offsets[i()] = dragPosition as T
                    return [...offsets]
                  })
                }}
                position={value}
              />
            )
          }
          return (
            <ControlPoint
              onDragMove={dragPosition => {
                setOffsets(offsets => {
                  const offset = offsets[i()]
                  if (offset && 'point' in offset) offset.point = dragPosition
                  return [...offsets]
                })
              }}
              onMouseDown={event => {
                event.propagation = false
              }}
              position={value.point}
            >
              <Line
                points={[
                  { x: 6, y: 6 },
                  addVectors(
                    value.control ?? { x: 0, y: 0 },
                    (offsets()[i()] as ControlledPoint).control ?? { x: 0, y: 0 },
                  ),
                ]}
                lineDash={[10, 5]}
              />
              <ControlPoint
                onDragMove={dragPosition => {
                  setOffsets(offsets => {
                    const offset = offsets[i()]
                    if (offset && 'control' in offset) offset.control = dragPosition
                    return [...offsets]
                  })
                }}
                position={value.control!}
                onMouseDown={event => {
                  event.propagation = false
                }}
              />
            </ControlPoint>
          )
        }}
      </For>
    </Group>
  ) as any as TokenElement<GroupToken>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (props.controls) controls.data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (props.controls) controls.data.hitTest(event)
    },
    offsets,
  }
}
