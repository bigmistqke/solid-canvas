import { createSignal } from 'solid-js'
import { CanvasMouseEvent, Position } from 'src/types'

import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor, For, Index, JSX, Show, untrack } from 'solid-js'
import { Arc, Group, Line } from 'src'
import {
  InternalContext,
  useInternalContext,
} from 'src/context/InternalContext'
import { Drag } from 'src/controllers/Drag'
import { Object2DToken } from 'src/parser'
import { createProcessedPoints } from 'src/utils/createProcessedPoints'
import { mergeGetters } from 'src/utils/mergeGetters'
import withContext from 'src/utils/withContext'
import { createController } from './createController'

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
  <Group position={{ x: props.position.x - 10, y: props.position.y - 10 }}>
    <Arc
      radius={10}
      stroke="transparent"
      fill={props.draggable !== false ? 'black' : 'lightgrey'}
      pointerEvents={props.draggable === false ? false : true}
      cursor={props.draggable ? 'pointer' : 'default'}
      hoverStyle={{
        fill: 'white',
        stroke: 'black',
      }}
      controllers={[
        Drag({
          active: true,
          onDragMove: (position, event) => {
            event.propagation = false
            props.onDragMove?.(position)
          },
          controlled: true,
        }),
      ]}
    />
    {props.children}
  </Group>
)

const VectorHandle = (props: {
  position: Position
  updateOffset: (position: Position) => void
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
      lineDash={[10, 5]}
      pointerEvents={false}
      stroke={props.draggable !== false ? 'black' : 'lightgrey'}
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

function createLinearHandles(
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

type HandleOptions = {
  active?: boolean
  controlled?: boolean
  type: 'cubic' | 'quadratic'
}

const createBezierHandle = createController<
  HandleOptions,
  { points: BezierPoint[] }
>((props, events, options) => {
  options = {
    active: true,
    controlled: false,
    ...options,
  }
  const processedPoints = createProcessedPoints(() => {
    return props().points ?? []
  }, options.type)

  const updateOffset: OffsetUpdater = (index, value, type) => {
    if (processedPoints()[index]?.[type])
      processedPoints()[index]![type] = value
  }

  const internalContext = useInternalContext()

  const handles = withContext(
    () => (
      <Show when={true}>
        <Group>
          <Index each={processedPoints()}>
            {(value, i) => (
              <BezierHandles
                index={i}
                updateOffset={(position, type) =>
                  updateOffset(i, position, type)
                }
                type={options.type}
                value={value()}
              />
            )}
          </Index>
        </Group>
      </Show>
    ),
    InternalContext,
    mergeGetters(internalContext!, {
      get origin() {
        return {
          x: (internalContext?.origin.x ?? 0) + props().position.x,
          y: (internalContext?.origin.y ?? 0) + props().position.y,
        }
      },
    }),
  ) as any as Accessor<Accessor<TokenElement<Object2DToken>>>

  events.onRender(ctx => {
    if (options.active) handles()().data.render(ctx)
  })
  events.onHitTest(event => {
    if (options.active) handles()().data.hitTest(event)
  })

  const result = mergeGetters(props(), {
    get points() {
      return processedPoints()
    },
  })
  return () => result
})

export { createBezierHandle as BezierHandle }
