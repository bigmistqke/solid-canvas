import { Accessor, Accessor, createMemo } from 'solid-js'
import { BezierProps } from 'src/components/Object2D/Shape2D/Path2D/Bezier'
import { ResolvedShape2DProps, Shape2DProps } from 'src/types'
import { mergeGetters } from 'src/utils/mergeGetters'
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
  function Controller(
    options?: ControllerOptions,
  ): Accessor<Shape2DProps<AdditionalProperties> & AdditionalProperties>
  function Controller(
    props: Accessor<ResolvedShape2DProps & AdditionalProperties>,
    events: RegisterControllerEvents,
    options: ControllerOptions,
  ): Accessor<Shape2DProps<AdditionalProperties> & AdditionalProperties>
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

    // NOTE:  `result` needs to be defined outside `mergeProps` for unknown reasons

    const result = callback(
      propsOrOptions as Accessor<ResolvedShape2DProps & AdditionalProperties>,
      events,
      options!,
    )

    //  NOTE: `mergeGetters` uses `Object.defineProperties` and `Object.getOwnPropertyDescriptors`
    //         under the hood to merge two objects without losing any getters in the process.
    //         This is notably less performant then `Object.assign` or spreading
    //         (see https://perf.link/#eyJpZCI6Im04YXdpM2NieTF5IiwidGl0bGUiOiJGaW5kaW5nIG51bWJlcnMgaW4gYW4gYXJyYXkgb2YgMTAwMCIsImJlZm9yZSI6ImNvbnN0IHNpZ25hbEEgPSAoKSA9PiAyXG5jb25zdCBzaWduYWxCID0gKCkgPT4gMTBcblxuY29uc3Qgb2JqZWN0QSAgPSB7XG4gIGdldCBpZEEoKXtcbiAgICByZXR1cm4gc2lnbmFsQSgpXG4gIH1cbn1cbmNvbnN0IG9iamVjdEIgID0ge1xuICBnZXQgaWRCKCl7XG4gICAgcmV0dXJuIHNpZ25hbEIoKVxuICB9XG59XG4iLCJ0ZXN0cyI6W3sibmFtZSI6ImFzc2lnbiIsImNvZGUiOiJjb25zdCBhc3NpZ24gPSBPYmplY3QuYXNzaWduKHt9LCBvYmplY3RBLCBvYmplY3RCKSIsInJ1bnMiOls4OTQ1MDAsNTYwNTAwLDEwNDg1MDAsNzA5MDAwLDE4ODAwMDAsMTY3MDUwMCwxNjUyNTAwLDEzMjkwMDAsMTY1NDUwMCwyNTI4MDAwLDI0NDI1MDAsMTUwNDAwMCwxNjAyNTAwLDI1OTA1MDAsMjM3NTAwMCw5MTE1MDAsMjQ2NjUwMCwxNjcwNTAwLDE3OTg1MDAsMTYyMzUwMCwyOTA5NTAwLDEwNDgwMDAsMTEwMjUwMCwxNjcwNTAwLDE2NDMwMDAsMTQxNDUwMCwxMTMxMDAwLDE0NTU1MDAsMjg0ODUwMCwzMDY0MDAwLDI1MDMwMDAsMTIzMzAwMCwyODQyMDAwLDEyNTIwMDAsMTY2OTUwMCwyNDgzNTAwLDIzODY1MDAsMTMwMzAwMCwxNzYxMDAwLDE3NzM1MDAsMTM1NDUwMCwxMTkwNTAwLDg2MDAwMCwxOTA3MDAwLDIzOTM1MDAsMTI5OTUwMCwyOTMwNTAwLDE0NjkwMDAsNDkwMDAsODY5NTAwLDE4NjI1MDAsODI1MDAwLDI3NjY1MDAsMjUwNTAwMCwxMjgyNTAwLDExODEwMDAsMTc5MDAwMCwyNjQzMDAwLDEyOTQwMDAsMTMzMjAwMCw5Mjg1MDAsMjQ3MDAwMCwxODUxMDAwLDIxMTU1MDAsMTY3MDUwMCw5MTQ1MDAsMjc4MzUwMCwxMTYwNTAwLDE2MTY1MDAsMjc5NTAwMCwxMTk1NTAwLDI0OTMwMDAsMTUwNjUwMCwxMjA1NTAwLDE2MDk1MDAsMjI0MTUwMCwxNTQyMDAwLDI4NTMwMDAsMTYxMzAwMCwxMDQ5NTAwLDYxODAwMCwyMDY0NTAwLDE1MjcwMDAsMjgzMTUwMCw1MDkwMDAsMjAxMzAwMCwxNzU1NTAwLDE3MzQwMDAsMTY3MDUwMCwyMDc4MDAwLDE4ODAwMDAsMTIyNDUwMCwxMzk2MDAwLDEyMzUwMDAsMzIxNTAwLDE0MTM1MDAsODIzMDAwLDE2NzA1MDAsMTU2MTAwMCwxMzgyNTAwXSwib3BzIjoxNjc1MzM1fSx7Im5hbWUiOiJzcHJlYWQgdGhlbSIsImNvZGUiOiJjb25zdCBzcHJlYWQgPSB7XG4gIC4uLm9iamVjdEEsXG4gIC4uLm9iamVjdEJcbn0iLCJydW5zIjpbNDk4MDAwLDc0OTUwMCw3MDYwMDAsNDczMDAwLDE0OTM1MDAsOTY0NTAwLDExNzcwMDAsNzk3NTAwLDEyMzMwMDAsMjAwMzAwMCwxOTk4NTAwLDEzMzI1MDAsMTAxNjAwMCwyMTk0MDAwLDc0OTUwMCwxMjc0NTAwLDIzMzk1MDAsMTI1MTAwMCwxMzUxMDAwLDkxMDUwMCwyMTc3MDAwLDgyMzAwMCw4NDgwMDAsODUzMDAwLDEyNzc1MDAsNjU1MDAwLDE3Mzc1MDAsMTMyNjAwMCwyMjc4NTAwLDI0MTQwMDAsMTUzMzUwMCw3ODQ1MDAsMTk4NTUwMCw3NTA1MDAsNzEzNTAwLDgwODUwMCwyMDE0MDAwLDk0ODAwMCwxMzkwNTAwLDEyMDQ1MDAsODgwMDAwLDc4MjAwMCw2NjYwMDAsMTI0MDUwMCwxMzIzMDAwLDkwNDAwMCwyMzk4MDAwLDEwMTkwMDAsNDUwMCw1NDgwMDAsNDczMDAwLDQxMjAwMCwxMzQxMDAwLDE5NTA1MDAsNzc5MDAwLDE3NTk1MDAsMjQ4ODUwMCwxODU0NTAwLDgyNzUwMCwxMzI1MDAwLDc1MjAwMCwxMTYyNTAwLDE0MTAwMDAsMTQwNTAwMCwxNDAyNTAwLDI2MDAwMCwyMzIxNTAwLDQ3MzAwMCwxNTIwMDAwLDIyOTAwMDAsMTA1ODAwMCwyMjY5MDAwLDEwMzEwMDAsOTEyNTAwLDExNDg1MDAsMTc1NjAwMCwxMDM5NTAwLDIzODY1MDAsOTkzNTAwLDY3ODUwMCw0Mjg1MDAsMTQ5NTAwMCw5MDc1MDAsMjQ2NTAwMCwzMjcwMDAsMTYxNzUwMCw3MjA1MDAsOTkyNTAwLDEzMTYwMDAsMTQwMzUwMCwxNTI3NTAwLDk1MDUwMCwxNTI2MDAwLDI2NzQwMDAsMTc2NTAwLDc4NzAwMCwyNDk1MDAsMjMyNTUwMCw4NzgwMDAsMTA0ODAwMF0sIm9wcyI6MTI0MDk1MH0seyJuYW1lIjoiZGVmaW5lUHJvcGVydGllcyIsImNvZGUiOiJjb25zdCBkZWZpbmUgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhcbiAgICB7fSxcbiAgICB7XG4gICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmplY3RBKSxcbiAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9iamVjdEIpLFxuICAgIH0sXG4gICkiLCJydW5zIjpbMTcyNTAwLDI5NDUwMCwyNjk1MDAsMTQ0MDAwLDUyMzAwMCwzMjMwMDAsNDYxNTAwLDM0MzUwMCw0MzM1MDAsNjE0NTAwLDcxNzUwMCw0MjY1MDAsNDE1NTAwLDczODAwMCw3MDc1MDAsMzIyNTAwLDM5MTUwMCw0MTc1MDAsNDk1MDAwLDc2OTAwMCw4NjI1MDAsMjY1NTAwLDI3NzAwMCw0MTA1MDAsOTY4NTAwLDM5MjUwMCw1NjkwMDAsNDM3NTAwLDY3MzUwMCw4NDI1MDAsNzQwMDAwLDc2NzUwMCw4NTQ1MDAsMjM1NTAwLDMyMjUwMCwyODM1MDAsNzE2MDAwLDQwMDAwMCw1MDM1MDAsNDQ5NTAwLDQ2NjAwMCwyMDI1MDAsMjgwMDAwLDU0ODAwMCw0Njk1MDAsMzAzNTAwLDcyMjAwMCwzOTgwMDAsMjk2NTAwLDE0NDAwMCwzMjQwMDAsMzAwMCw0NDkwMDAsNzY5MDAwLDY3MDAwMCw3MzU1MDAsNDU3MDAwLDY3MjUwMCwyMjM1MDAsNTQ4NTAwLDY0NDUwMCw5MzgwMDAsNDczNTAwLDk4NjAwMCw0MzM1MDAsNzE1MDAsODA5NTAwLDE0NDAwMCw1NDkwMDAsODAwMDAwLDQwNzUwMCw4MjA1MDAsNDMzNTAwLDg3NTAwMCw0MjMwMDAsNjUyNTAwLDQwOTUwMCw3NDIwMDAsMzczMDAwLDI3NTAwMCwxMjU1MDAsNTgzNTAwLDcyOTUwMCw4NTY1MDAsODkwMDAsNTc5NTAwLDIwMzUwMCw0NzY1MDAsNDg5MDAwLDk0MTUwMCw1NDkwMDAsMzc3NTAwLDI2OTUwMCw5MDcwMDAsMzIwMDAsMzE3NTAwLDQzMDAwLDcyNzUwMCw3OTk1MDAsNDA1NTAwXSwib3BzIjo0OTM5NjV9XSwidXBkYXRlZCI6IjIwMjMtMDMtMzFUMTM6Mzc6MzcuNDMyWiJ9)
    //         but it allows us to perform a merging operation only once (when initializing),
    //         while `Object.assign` or spreading would cause a merge with each update.

    return createMemo(() =>
      mergeGetters(
        (
          propsOrOptions as Accessor<
            ResolvedShape2DProps<AdditionalProperties> & AdditionalProperties
          >
        )(),
        result,
      ),
    ) as Accessor<Shape2DProps<AdditionalProperties> & AdditionalProperties>
  }
  return Controller
}
export { createController }
