import { createEffect, createSignal, mergeProps } from 'solid-js'
import { Shape2DStyle, Transforms } from 'src/types'
import { createController } from './createController'

type HoverOptions = {
  active?: boolean
  style: Shape2DStyle | undefined
  transform: Transforms | undefined
}

const Hover = createController<HoverOptions>(
  (props, events, token, options) => {
    const [isHovered, setIsHovered] = createSignal(false)

    createEffect(() => {
      if (!options.style) return
      events.onMouseEnter(() => {
        setIsHovered(true)
      })
      events.onMouseLeave(() => {
        setIsHovered(false)
      })
    })

    const mergedStyle = mergeProps(props().style, options.style)
    const mergedTransform = mergeProps(props().transform, options.transform)

    return {
      get style() {
        return options.style && isHovered() ? mergedStyle : props().style
      },
      get transform() {
        return options.transform && isHovered()
          ? mergedTransform
          : props().transform
      },
    }
  },
)

export { Hover }
