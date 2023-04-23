import { createLazyMemo } from '@solid-primitives/memo'
import { Accessor, createMemo, mapArray } from 'solid-js'
import { ControllerEvents } from 'src/controllers/controllers'
import { ResolvedShape2DProps, Shape2DProps } from 'src/types'
import { DeepRequired } from './typehelpers'
import { CanvasToken } from 'src/parser'

const createControlledProps = <
  T extends Record<string, any>,
  U extends Shape2DProps<T> & T,
>(
  props: U,
  defaultControllers: Accessor<T | Shape2DProps<T>>[] = [],
  token: Accessor<CanvasToken>,
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

  // NOTE:  I have been juggling around a lot with the types.
  //        It's a bit tricky to figure out.
  //        The current state is a compromise.
  //@ts-ignore
  const controllers: Accessor<Accessor<T | Shape2DProps<T>>[]> = createLazyMemo(
    mapArray(
      () =>
        props.controllers
          ? [...defaultControllers, ...props.controllers]
          : [...defaultControllers],
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
            onRender: callback => events.onRender.push(callback),
            onHitTest: callback => events.onHitTest.push(callback),
          },
          token,
        )
      },
    ),
  )

  const output = createMemo(
    () =>
      (controllers()[controllers().length - 1]?.() ??
        props) as ResolvedShape2DProps<U> & DeepRequired<U>,
  )

  return {
    get props() {
      // return props
      return output()
    },
    emit,
  }
}

export { createControlledProps }
