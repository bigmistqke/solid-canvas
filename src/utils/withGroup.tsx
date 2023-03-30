import { TokenComponent } from '@solid-primitives/jsx-tokenizer'
import { createLazyMemo } from '@solid-primitives/memo'
import { Accessor, mapArray, splitProps } from 'solid-js'
import { Object2DProps } from 'src/components/Object2D/createObject2D'
import { Group } from 'src/components/Object2D/Group'
import {
  CanvasMouseEvent,
  CanvasMouseEventTypes,
  Shape2DProps,
} from 'src/types'

function withGroup<T extends Record<string, any>, U extends unknown>(
  Component: TokenComponent<T, U>,
) {
  return (props: T & Shape2DProps & Object2DProps) => {
    const events: Record<
      CanvasMouseEventTypes,
      ((event: CanvasMouseEvent) => void)[]
    > = {
      onMouseDown: [],
      onMouseMove: [],
      onMouseUp: [],
      onMouseLeave: [],
      onMouseEnter: [],
    }

    const controllers: Accessor<Accessor<T & Object2DProps>[]> = createLazyMemo(
      mapArray(
        () => props.controllers ?? [],
        (controller, index) =>
          controller(index() === 0 ? props : controllers()[index() - 1]!(), {
            onMouseDown: callback => events.onMouseDown.push(callback),
            onMouseMove: callback => events.onMouseMove.push(callback),
            onMouseUp: callback => events.onMouseUp.push(callback),
            onMouseLeave: callback => events.onMouseLeave.push(callback),
            onMouseEnter: callback => events.onMouseEnter.push(callback),
          }),
      ),
    )

    const controlledProps = () =>
      splitProps(controllers()[controllers().length - 1]?.() ?? props, [
        'children',
        'clip',
        'position',
      ])

    const groupProps = () => controlledProps()[0]
    const shapeProps = () => controlledProps()[1]

    return (
      <Group
        {...groupProps()}
        onMouseDown={events.onMouseDown}
        onMouseUp={events.onMouseUp}
        onMouseMove={events.onMouseMove}
        onMouseEnter={events.onMouseEnter}
        onMouseLeave={events.onMouseLeave}
      >
        {props.children}
        <Component {...(shapeProps() as T)} />
      </Group>
    )
  }
}
export default withGroup
