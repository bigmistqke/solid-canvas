import { Accessor } from 'solid-js'
import { ResolvedShape2DProps } from 'src/types'
import { RegisterControllerEvents } from '.'

const createController = <
  ControllerOptions extends Record<string, any>,
  AdditionalProperties = {},
>(
  callback: (
    props: Accessor<ResolvedShape2DProps & AdditionalProperties>,
    events: RegisterControllerEvents,
    options: ControllerOptions,
  ) => void,
) => {
  function Controller(options?: ControllerOptions): any
  function Controller(
    props: Accessor<ResolvedShape2DProps & AdditionalProperties>,
    events: RegisterControllerEvents,
    options: ControllerOptions,
  ): any
  function Controller(
    propsOrOptions?: Accessor<ResolvedShape2DProps> | ControllerOptions,
    events?: RegisterControllerEvents,
    options?: ControllerOptions,
  ) {
    if (!events) {
      return (
        props: Accessor<ResolvedShape2DProps & AdditionalProperties>,
        events: RegisterControllerEvents,
      ) => Controller(props, events, propsOrOptions as ControllerOptions)
    }

    return callback(
      propsOrOptions as Accessor<ResolvedShape2DProps & AdditionalProperties>,
      events,
      options!,
    )
  }
  return Controller
}

export { createController }
