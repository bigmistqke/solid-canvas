import { Accessor } from 'solid-js'
import { Shape2DProps } from 'src/types'
import { RegisterControllerEvents } from '.'

const createController = <ControllerOptions extends Record<string, any>>(
  callback: (
    props: Shape2DProps,
    events: RegisterControllerEvents,
    options: ControllerOptions,
  ) => void,
) => {
  function Controller(options?: ControllerOptions): any
  function Controller(
    props: Accessor<Shape2DProps>,
    events: RegisterControllerEvents,
    options: ControllerOptions,
  ): any
  function Controller(
    propsOrOptions?: Accessor<Shape2DProps> | ControllerOptions,
    events?: RegisterControllerEvents,
    options?: ControllerOptions,
  ) {
    if (!events || !options) {
      let options = (propsOrOptions as ControllerOptions) ?? {
        active: true,
        controlled: false,
      }
      return (
        props: Accessor<Shape2DProps>,
        events: RegisterControllerEvents,
      ) => Controller(props, events, options)
    }
    callback((propsOrOptions as Accessor<Shape2DProps>)(), events, options)
  }
  return Controller
}

export { createController }
