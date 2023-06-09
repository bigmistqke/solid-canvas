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
import { Arc, Group, Line } from 'src'
import { Drag } from 'src/controllers/Drag'
import { Object2DToken } from 'src/parser'
import { CanvasMouseEvent, Vector } from 'src/types'

type BezierPoint = {
  point: Vector
  control?: Vector
  oppositeControl?: Vector
}

type OffsetUpdater = (
  index: number,
  value: Vector,
  type: 'control' | 'point' | 'oppositeControl',
) => void

const Handle = (props: {
  position: Vector
  children?: JSX.Element | JSX.Element[]
  draggable?: boolean
  onDragMove?: (position: Vector) => void
}) => (
  <Group>
    <Arc
      style={{
        radius: 10,
        stroke: 'transparent',
        fill: props.draggable !== false ? 'black' : 'lightgrey',
        pointerEvents: props.draggable === false ? false : true,
        cursor: props.draggable ? 'pointer' : 'default',
        '&:hover': {
          fill: 'white',
          stroke: 'black',
        },
      }}
      transform={{
        position: { x: props.position.x - 10, y: props.position.y - 10 },
      }}
      controllers={[
        Drag({ active: true, onDragMove: props.onDragMove, controlled: true }),
      ]}
    />
    {props.children}
  </Group>
)

const VectorHandle = (props: {
  position: Vector
  updateOffset: (position: Vector) => void
  draggable?: boolean
}) => (
  <>
    <Handle
      onDragMove={dragPosition => props.updateOffset(dragPosition)}
      position={props.position}
      draggable={props.draggable}
    />
    <Line
      points={[{ x: 0, y: 0 }, props.position]}
      style={{
        lineDash: [10, 5],
        pointerEvents: false,
        stroke: props.draggable !== false ? 'black' : 'lightgrey',
      }}
    />
  </>
)

const BezierHandles = (props: {
  index: number
  updateOffset: (
    position: Vector,
    type: 'control' | 'oppositeControl' | 'point',
  ) => void
  value: BezierPoint & { automatic: boolean }
  type: 'cubic' | 'quadratic'
}) => {
  return (
    <Group
      transform={{
        position: props.value.point,
      }}
    >
      <Handle
        onDragMove={offset => props.updateOffset(offset, 'point')}
        position={{ x: 0, y: 0 }}
        draggable={true}
      />
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
          updateOffset={offset => props.updateOffset(offset, 'oppositeControl')}
          draggable={props.type === 'cubic' && !props.value.automatic}
        />
      </Show>
    </Group>
  )
}
function createLinearHandles(
  points: Accessor<Vector[]>,
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
  ) as any as TokenElement<Object2DToken>

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
function createBezierHandles(
  points: Accessor<(BezierPoint & { automatic: boolean })[]>,
  editable: Accessor<boolean | undefined>,
  type: 'cubic' | 'quadratic',
) {
  const updateOffset: OffsetUpdater = (index, value, type) => {
    if (points()[index]?.[type]) points()[index]![type] = value
  }

  const handles = (
    <Show when={editable()}>
      <Group>
        <Index each={points()}>
          {(value, i) => (
            <BezierHandles
              index={i}
              updateOffset={(position, type) => updateOffset(i, position, type)}
              type={type}
              value={value()}
            />
          )}
        </Index>
      </Group>
    </Show>
  ) as any as Accessor<TokenElement<Object2DToken>>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (editable()) handles().data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (editable()) handles().data.hitTest(event)
    },
  }
}

export { createLinearHandles, createBezierHandles }
