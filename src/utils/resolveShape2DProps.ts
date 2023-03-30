import { mergeProps } from 'solid-js'
import { defaultShape2DProps } from 'src/defaultProps'
import { Shape2DProps } from 'src/types'

function resolveShape2DProps<T extends Shape2DProps, U>(props: T, defaults: U) {
  return mergeProps({ ...defaultShape2DProps, ...defaults }, props)
}
export { resolveShape2DProps }
