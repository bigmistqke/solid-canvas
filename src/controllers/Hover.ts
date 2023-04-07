import { createEffect, createSignal, mergeProps } from 'solid-js'
import { Shape2DStyle, Transforms } from 'src/types'
import { createController } from './createController'

type HoverOptions = {
  active?: boolean
  style: Shape2DStyle | undefined
  transform: Transforms | undefined
}
const Hover = createController<HoverOptions>((props, events, options) => {
  const [isHovered, setIsHovered] = createSignal(false)

  createEffect(() => {
    if (!options.style) return
    events.onMouseEnter(() => setIsHovered(true))
    events.onMouseLeave(() => setIsHovered(false))
  })

  const styles = mergeProps(props().style, options.style)
  const transforms = mergeProps(props().transform, options.transform)

  return {
    get style() {
      return isHovered() && options.style ? styles : props().style
    },
    get transform() {
      return isHovered() && options.transform ? transforms : props().transform
    },
  }
})

export { Hover }
