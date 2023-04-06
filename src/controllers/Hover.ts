import { createEffect, createSignal, mergeProps, untrack } from 'solid-js'
import { Shape2DStyle } from 'src/types'
import { createController } from './createController'

type HoverOptions = {
  active?: boolean
  style: Shape2DStyle
}
const Hover = createController<HoverOptions>((props, events, options) => {
  const [isHovered, setIsHovered] = createSignal(false)

  createEffect(() => {
    if (!options.style) return
    events.onMouseEnter(() => setIsHovered(true))
    events.onMouseLeave(() => setIsHovered(false))
  })

  const styles = mergeProps(props().style, options.style)

  return {
    get style() {
      return isHovered() && props().style ? styles : props().style
    },
  }
})

export { Hover }
