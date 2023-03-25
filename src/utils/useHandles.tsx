import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import {
  Accessor,
  createSignal,
  For,
  Index,
  JSX,
  Show,
  untrack,
} from 'solid-js'
import { Arc, Group, Line, Text } from 'src'
import { GroupToken } from 'src/parser'
import { CanvasMouseEvent, Position } from 'src/types'
import addPositions from './addPositions'
import invertPosition from './invertPosition'

type BezierPoint = {
  point: Position
  control?: Position
  oppositeControl?: Position
  automatic: boolean
}

type OffsetUpdater = (
  index: number,
  value: Position,
  type: 'control' | 'point' | 'oppositeControl',
) => void

const Handle = (props: {
  position: Position
  children?: JSX.Element | JSX.Element[]
  draggable?: boolean
  onDragMove?: (position: Position) => void
}) => (
  <Arc
    onDragMove={props.onDragMove}
    radius={6}
    stroke="transparent"
    fill={props.draggable !== false ? 'black' : 'lightgrey'}
    position={{ x: props.position.x - 6, y: props.position.y - 6 }}
    draggable={props.draggable === false ? false : 'controlled'}
    pointerEvents={props.draggable === false ? false : true}
    onMouseDown={event => {
      event.propagation = false
    }}
  >
    {props.children}
  </Arc>
)

const VectorHandle = (props: {
  position: Position
  updateOffset: (position: Position) => void
  draggable?: boolean
}) => (
  <>
    <Line
      points={[{ x: 0, y: 0 }, props.position]}
      lineDash={[10, 5]}
      pointerEvents={false}
      stroke={props.draggable !== false ? 'black' : 'lightgrey'}
    />
    <Handle
      onDragMove={dragPosition => props.updateOffset(dragPosition)}
      position={props.position}
      draggable={props.draggable}
    />
  </>
)

const BezierHandles = (props: {
  index: number
  updateOffset: (
    position: Position,
    type: 'control' | 'oppositeControl' | 'point',
  ) => void
  offset?: BezierPoint
  value: BezierPoint
  type: 'cubic' | 'quadratic'
  automatic: boolean
}) => {
  return (
    <Handle
      onDragMove={offset => props.updateOffset(offset, 'point')}
      position={props.value.point}
      draggable={true}
    >
      <Group position={{ x: 6, y: 6 }}>
        <Show when={props.value.control}>
          <VectorHandle
            position={props.value.control!}
            updateOffset={offset => props.updateOffset(offset, 'control')}
            draggable={props.type === 'cubic' || !props.value.automatic}
          />
        </Show>
        <Show when={props.value.oppositeControl}>
          <VectorHandle
            position={props.value.oppositeControl!}
            updateOffset={offset =>
              props.updateOffset(offset, 'oppositeControl')
            }
            draggable={props.type === 'cubic' && !props.value.automatic}
          />
        </Show>
      </Group>
    </Handle>
  )
}
function useLinearHandles(
  points: Accessor<Position[]>,
  editable: Accessor<boolean | undefined>,
) {
  const [offsets, setOffsets] = createSignal(
    points().map(v => ({ x: 0, y: 0 })),
  )
  const handles = (
    <Group>
      {/* 
        TODO: without untrack it would re-mount all ControlPoints with each interaction 
      */}
      <For each={untrack(() => points())}>
        {(value, i) => (
          <Handle
            onDragMove={dragPosition => {
              setOffsets(offsets => {
                offsets[i()] = dragPosition
                return [...offsets]
              })
            }}
            position={value}
          />
        )}
      </For>
    </Group>
  ) as any as TokenElement<GroupToken>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (editable()) handles.data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (editable()) handles.data.hitTest(event)
    },
    offsets,
  }
}
function useBezierHandles(
  values: Accessor<BezierPoint[]>,
  editable: Accessor<boolean | undefined>,
  type: 'cubic' | 'quadratic',
) {
  const [offsets, setOffsets] = createSignal<BezierPoint[]>(
    values().map(v => ({
      control: { x: 0, y: 0 },
      oppositeControl: { x: 0, y: 0 },
      point: { x: 0, y: 0 },
      automatic: v.automatic,
    })),
  )

  const updateOffset: OffsetUpdater = (index, value, type) =>
    setOffsets(offsets => {
      const offset = offsets[index]
      if (offset && type && type in offset)
        (offset as BezierPoint)[type] = value
      return [...offsets]
    })

  const controls = () => {
    const result: BezierPoint[] = []
    values().forEach((value, i) => {
      const point = addPositions(value.point, offsets()[i]!.point)

      if (type === 'cubic') {
        result.push({
          automatic: value.automatic,
          point,
          control: addPositions(value.control, offsets()[i]?.control),
          oppositeControl: addPositions(
            value.oppositeControl,
            value.automatic
              ? invertPosition(offsets()[i]?.control)
              : offsets()[i]?.oppositeControl,
          ),
        })
        return
      }

      const oppositeControl = addPositions(
        result[i - 1]?.control,
        result[i - 1]?.point,
        invertPosition(addPositions(value.point, offsets()[i]?.point)),
      )

      const control = value.automatic
        ? invertPosition(oppositeControl)
        : addPositions(value.control, offsets()[i]?.control)

      result.push({
        automatic: value.automatic,
        point,
        control: i === values().length - 1 ? undefined : control,
        oppositeControl: i === 0 ? undefined : oppositeControl,
      })
    })
    return result
  }

  const handles = (
    <Group>
      {/* 
        TODO: without untrack it would re-mount all ControlPoints with each interaction 
      */}

      <Index each={controls()}>
        {(value, i) => (
          <BezierHandles
            index={i}
            updateOffset={(
              position: Position,
              type: 'control' | 'oppositeControl' | 'point',
            ) => updateOffset(i, position, type)}
            type={type}
            automatic={false}
            value={value()}
          />
        )}
      </Index>
    </Group>
  ) as any as TokenElement<GroupToken>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (editable()) handles.data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (editable()) handles.data.hitTest(event)
    },
    offsets,
  }
}

export { useLinearHandles, useBezierHandles }
