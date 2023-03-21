import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { resolveColor } from 'src/utils/resolveColor'

import { useInternalContext } from 'src/context/InternalContext'
import { parser } from 'src/parser'
import { Color, Position } from 'src/types'

type GradientProps = { stops: { offset: number; color: Color }[] } & (
  | {
      type: 'linear'
      start: Position
      end: Position
    }
  | {
      type: 'radial'
      start: Position
      startRadius: number
      end: Position
      endRadius: number
    }
  | {
      type: 'conic'
      center: Position
      startAngle: number
      end: Position
    }
)

const Gradient = createToken(parser, (props: GradientProps) => {
  const merged = mergeProps({}, props)

  const canvas = useInternalContext()

  const getGradient = () => {
    if (!canvas) return
    const { ctx } = canvas
    switch (props.type) {
      case 'linear':
        return ctx.createLinearGradient(props.start.x, props.start.y, props.end.x, props.end.y)
      case 'radial':
        return ctx.createRadialGradient(
          props.start.x,
          props.start.y,
          props.startRadius,
          props.end.x,
          props.end.y,
          props.endRadius,
        )
      case 'conic':
        return ctx.createConicGradient(props.startAngle, props.center.x, props.center.y)
    }
  }

  const color = () => {
    const gradient = getGradient()
    if (!gradient) return

    // Add three color stops

    for (let { offset, color } of props.stops) {
      gradient.addColorStop(offset, resolveColor(color) ?? 'black')
    }
    /* gradient.addColorStop(0, 'green')
    gradient.addColorStop(0.5, 'cyan')
    gradient.addColorStop(1, 'green') */
    return gradient
  }

  return {
    type: 'Color',
    color,
  }
})

export { Gradient }
