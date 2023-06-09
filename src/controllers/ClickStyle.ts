import { createSignal } from 'solid-js'
import { ExtendedColor } from 'src/types'
import { mergeGetters } from 'src/utils/mergeGetters'
import { createController } from './createController'

type HoverOptions = {
  active?: boolean
  stroke?: ExtendedColor
  fill?: ExtendedColor
}
const ClickStyle = createController<HoverOptions>((props, events, options) => {
  const [selected, setSelected] = createSignal(false)

  events.onMouseDown(() => setSelected(true))
  events.onMouseUp(() => setSelected(false))

  return mergeGetters(props(), {
    get stroke() {
      return selected() ? options.stroke : props().style.stroke
    },
    get fill() {
      return selected() ? options.fill : props().style.fill
    },
  })
})

export { ClickStyle }
