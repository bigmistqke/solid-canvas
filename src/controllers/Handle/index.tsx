import { createSignal } from 'solid-js'
import { CanvasMouseEvent, Vector, Shape2DProps } from 'src/types'

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
import { createController } from '../createController'
import { QuadraticProps } from 'src/components/Object2D/Shape2D/Path2D/Quadratic'
import { BezierProps } from 'src/components/Object2D/Shape2D/Path2D/Bezier'

type CubicPoint = {
  point: Vector
  control: Vector
  oppositeControl?: Vector
}

type QuadraticPoint = {
  point: Vector
  control?: Vector
}

type BezierPoint = CubicPoint | QuadraticPoint

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
      lineDash={[10, 5]}
      pointerEvents={false}
      stroke={props.draggable !== false ? 'black' : 'lightgrey'}
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
      <Show
        when={'oppositeControl' in props.value && props.value.oppositeControl}
      >
        <VectorHandle
          position={(props.value as CubicPoint).oppositeControl!}
          updateOffset={offset => props.updateOffset(offset, 'oppositeControl')}
          draggable={props.type === 'cubic' && !props.value.automatic}
        />
      </Show>
    </Group>
  )
}

// TODO:  infer types `props` `events` `options` instead of any
const constructBezierHandle = (props: any, events: any, options: any) => {
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
          x: (internalContext?.matrixValues.e ?? 0) + props().position.x,
          y: (internalContext?.matrixValues.f ?? 0) + props().position.y,
        }
      },
    }),
  ) as any as Accessor<Accessor<TokenElement<Object2DToken>>>

  events.onRender((ctx: any) => {
    if (options.active) handles()().data.render(ctx)
  })
  events.onHitTest((event: any) => {
    if (options.active) handles()().data.hitTest(event)
  })

  return {
    get points() {
      return processedPoints()
    },
  }
}

type HandleOptions = {
  active?: boolean
  controlled?: boolean
}

const CubicHandle = createController<HandleOptions, { points: CubicPoint[] }>(
  (props, events, options) =>
    constructBezierHandle(props, events, { ...options, type: 'cubic' }),
)

const QuadraticHandle = createController<
  HandleOptions,
  { points: QuadraticPoint[] }
>((props, events, options) =>
  constructBezierHandle(props, events, { ...options, type: 'quadratic' }),
)
export { CubicHandle, QuadraticHandle }
