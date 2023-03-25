import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { createSignal, For, JSX, Show, untrack } from 'solid-js'
import { Arc, Group, Line } from 'src'
import { GroupToken } from 'src/parser'
import { CanvasMouseEvent, Position } from 'src/types'
import addPositions from './addVectors'

type BezierPoint = {
  point: Position
  control?: Position
  oppositeControl?: Position
}

type OffsetUpdater = (
  index: number,
  value: Position,
  type: 'control' | 'point',
) => void

const Handle = (props: {
  position: Position
  children?: JSX.Element | JSX.Element[]
  draggable?: boolean
  onDragMove?: (position: Position) => void
  onMouseDown?: (event: CanvasMouseEvent) => void
}) => (
  <Arc
    onDragMove={props.onDragMove}
    radius={6}
    fill="black"
    position={{ x: props.position.x - 6, y: props.position.y - 6 }}
    draggable={props.draggable === false ? false : 'controlled'}
    pointerEvents={props.draggable === false ? false : true}
    onMouseDown={props.onMouseDown}
  >
    {props.children}
  </Arc>
)

const VectorHandle = (props: {
  position: Position
  index: number
  updateOffset: OffsetUpdater
  value: BezierPoint
  draggable?: boolean
}) => (
  <>
    <Line
      points={[{ x: 0, y: 0 }, props.position]}
      lineDash={[10, 5]}
      pointerEvents={false}
    />
    <Handle
      onDragMove={dragPosition =>
        props.updateOffset(props.index, dragPosition, 'control')
      }
      position={props.position}
      onMouseDown={event => {
        event.propagation = false
      }}
      draggable={props.draggable}
    />
  </>
)

const BezierHandles = (props: {
  index: number
  updateOffset: OffsetUpdater
  offsets: BezierPoint[]
  value: BezierPoint
}) => {
  // NOTE:  I think this is specific to Quadratic and might not apply to Bezier
  const oppositeControlPosition = () =>
    addPositions(
      props.value.oppositeControl,
      props.offsets[props.index - 1]?.control,
      props.offsets[props.index - 1]?.point,
      props.offsets[props.index]
        ? {
            x: props.offsets[props.index]!.point.x * -1,
            y: props.offsets[props.index]!.point.y * -1,
          }
        : undefined,
    ) ?? { x: 0, y: 0 }

  const controlPosition = () =>
    addPositions(
      props.value.control,
      (props.offsets[props.index] as BezierPoint).control,
    ) ?? {
      x: 0,
      y: 0,
    }

  const handlePosition = () =>
    addPositions(
      props.value.point,
      (props.offsets[props.index] as BezierPoint).point,
    )

  return (
    <Handle
      onDragMove={dragPosition =>
        props.updateOffset(props.index, dragPosition, 'point')
      }
      onMouseDown={event => {
        event.propagation = false
      }}
      position={handlePosition()}
    >
      <Group position={{ x: 6, y: 6 }}>
        <Show when={props.value.control}>
          <VectorHandle
            position={controlPosition()}
            updateOffset={props.updateOffset}
            value={props.value}
            index={props.index}
          />
        </Show>
        <Show when={props.value.oppositeControl}>
          <VectorHandle
            position={oppositeControlPosition()}
            updateOffset={props.updateOffset}
            value={props.value}
            index={props.index}
            draggable={false}
          />
        </Show>
      </Group>
    </Handle>
  )
}

export default function <T extends Position | BezierPoint>(props: {
  points: T[]
  editable?: boolean | undefined
}) {
  const [offsets, setOffsets] = createSignal<T[]>(
    props.points.map(v =>
      'x' in v
        ? { x: 0, y: 0 }
        : 'oppositeControl' in v
        ? {
            control: { x: 0, y: 0 },
            oppositeControl: { x: 0, y: 0 },
            point: { x: 0, y: 0 },
          }
        : { control: { x: 0, y: 0 }, point: { x: 0, y: 0 } },
    ) as T[],
  )

  const updateOffset = (
    index: number,
    value: Position,
    type?: 'control' | 'point',
  ) => {
    setOffsets(offsets => {
      const offset = offsets[index]
      if (offset && type && type in offset)
        (offset as BezierPoint)[type] = value
      return [...offsets]
    })
  }

  const handles = (
    <Group>
      {/* 
        TODO: without untrack it would re-mount all ControlPoints with each interaction 
      */}
      <For each={untrack(() => props.points)}>
        {(value, i) => {
          if ('x' in value) {
            return (
              <Handle
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
            <BezierHandles
              offsets={offsets() as BezierPoint[]}
              value={value}
              index={i()}
              updateOffset={updateOffset}
            />
          )
        }}
      </For>
    </Group>
  ) as any as TokenElement<GroupToken>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (props.editable) handles.data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (props.editable) handles.data.hitTest(event)
    },
    offsets,
  }
}
