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
    onFrame: [],
    onHitTest: [],
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
              onFrame: callback => events.onFrame.push(callback),
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
    events,
  }
}

export { createControlledProps }
