import { createSignal } from 'solid-js'
import { Shape2DStyle } from 'src/types'
import { createController } from './createController'

type HoverOptions = {
  active?: boolean
  style: Shape2DStyle
}
const Hover = createController<HoverOptions>((props, events, options) => {
  const [isHovered, setIsHovered] = createSignal(false)

  events.onMouseEnter(() => setIsHovered(true))
  events.onMouseLeave(() => setIsHovered(false))

  return {
    get style() {
      return isHovered() ? options.style : props().style
    },
  }
})

export { Hover }
