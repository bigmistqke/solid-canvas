import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import {
  Accessor,
  createMemo,
  createSignal,
  For,
  Index,
  JSX,
  mapArray,
  Show,
  untrack,
} from 'solid-js'
import { createLazyMemo } from '@solid-primitives/memo'
import { Arc, Group, Line } from 'src'
import { GroupToken } from 'src/parser'
import { CanvasMouseEvent, Position } from 'src/types'
import addPositions from './addPositions'
import invertPosition from './invertPosition'

type BezierPoint = {
  point: Position
  control?: Position
  oppositeControl?: Position
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
    radius={10}
    stroke="transparent"
    fill={props.draggable !== false ? 'black' : 'lightgrey'}
    position={{ x: props.position.x - 10, y: props.position.y - 10 }}
    draggable={props.draggable === false ? false : 'controlled'}
    pointerEvents={props.draggable === false ? false : true}
    cursor={props.draggable ? 'pointer' : 'default'}
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
  value: BezierPoint & { automatic: boolean }
  type: 'cubic' | 'quadratic'
}) => {
  return (
    <Group position={props.value.point}>
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
  ) as any as Accessor<TokenElement<GroupToken>>

  return {
    render: (ctx: CanvasRenderingContext2D) => {
      if (editable()) handles().data.render(ctx)
    },
    hitTest: (event: CanvasMouseEvent) => {
      if (editable()) handles().data.hitTest(event)
    },
  }
}

export { useLinearHandles, useBezierHandles }
