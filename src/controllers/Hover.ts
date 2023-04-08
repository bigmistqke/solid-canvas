import {
  createEffect,
  createMemo,
  createSignal,
  indexArray,
  mergeProps,
  onCleanup,
  untrack,
} from 'solid-js'
import { RGB, Shape2DStyle, Transforms } from 'src/types'
import { createController } from './createController'
import { deepMergeGetters } from 'src/utils/mergeGetters'

type HoverOptions = {
  active?: boolean
  style: Shape2DStyle | undefined
  transform: Transforms | undefined
}

const Hover = createController<HoverOptions>((props, events, options) => {
  const [isHovered, setIsHovered] = createSignal(false)

  createEffect(() => {
    if (!options.style) return
    events.onMouseEnter(() => {
      setIsHovered(true)
      // tweens().forEach(t => t[1]('forward'))
    })
    events.onMouseLeave(() => {
      setIsHovered(false)
      // tweens().forEach(t => t[1]('backward'))
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
})

export { Hover }
