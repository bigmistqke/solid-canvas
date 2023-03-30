import { createLazyMemo } from '@solid-primitives/memo'
import { Accessor, createEffect, createRoot, mapArray } from 'solid-js'
import { ControllerEvents } from 'src/controllers'
import { ResolvedShape2DProps } from 'src/types'

const createControlledProps = <
  T extends Record<string, any>,
  U extends ResolvedShape2DProps<T>,
>(
  props: U,
) => {
  const events: {
    [K in keyof ControllerEvents]: ControllerEvents[K][]
  } = {
    onMouseDown: [],
    onMouseMove: [],
    onMouseUp: [],
    onMouseLeave: [],
    onMouseEnter: [],
    onRender: [],
    onHitTest: [],
  }

  const emit: {
    [K in keyof ControllerEvents]: ControllerEvents[K]
  } = {
    onMouseDown: event =>
      events.onMouseDown.forEach(callback => callback(event)),
    onMouseMove: event =>
      events.onMouseMove.forEach(callback => callback(event)),
    onMouseUp: event => events.onMouseUp.forEach(callback => callback(event)),
    onMouseLeave: event =>
      events.onMouseLeave.forEach(callback => callback(event)),
    onMouseEnter: event =>
      events.onMouseEnter.forEach(callback => callback(event)),
    onRender: event => events.onRender.forEach(callback => callback(event)),
    onHitTest: event => events.onHitTest.forEach(callback => callback(event)),
  }

  const controllers: Accessor<Accessor<ResolvedShape2DProps<T>>[]> =
    createLazyMemo(
      mapArray(
        () => props.controllers!,
        (controller, index) => {
          return controller(
            () =>
              index() === 0 ? props : controllers()?.[index() - 1]?.() ?? props,
            {
              onMouseDown: callback => events.onMouseDown.push(callback),
              onMouseMove: callback => events.onMouseMove.push(callback),
              onMouseUp: callback => events.onMouseUp.push(callback),
              onMouseLeave: callback => events.onMouseLeave.push(callback),
              onMouseEnter: callback => events.onMouseEnter.push(callback),
              onFrame: callback => events.onRender.push(callback),
              onHitTest: callback => events.onHitTest.push(callback),
            },
          )
        },
      ),
    )

  return {
    get props() {
      return (controllers()[controllers().length - 1]?.() ?? props) as U
    },
    emit,
  }
}

export { createControlledProps }
