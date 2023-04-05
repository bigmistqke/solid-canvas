import { splitProps } from 'solid-js'
import { defaultShape2DProps } from 'src/defaultProps'
import { Shape2DProps } from 'src/types'
import { mergeGetters } from './mergeGetters'
import { RequireOptionals } from './typehelpers'

function mergeShape2DProps<T extends Record<string, unknown>>(
  props: Shape2DProps<T> & T,
  defaults: RequireOptionals<T>,
) {
  const [, _props] = splitProps(props, ['children'])
  return mergeGetters({ ...defaultShape2DProps, ...defaults }, _props)
}
export { mergeShape2DProps }
