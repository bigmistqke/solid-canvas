import { mergeProps, splitProps } from 'solid-js'
import { defaultShape2DProps } from 'src/defaultProps'
import { Shape2DProps } from 'src/types'

// TODO:   we have to think a bit more through how to type these arguments/returntype
function mergeShape2DProps<
  T extends Record<string, unknown>,
  U extends { [K in keyof T]: T[K] },
>(props: Shape2DProps<T>, defaults: Partial<U>) {
  ;[, props] = splitProps(props, ['children'])
  return mergeProps({ ...defaultShape2DProps, ...defaults }, props)
}
export { mergeShape2DProps }
