import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { resolveColor } from 'src/utils/resolveColor'

import { useInternalContext } from 'src/context/InternalContext'
import { parser } from 'src/parser'
import { Color, Vector } from 'src/types'

type GradientProps = { stops: { offset: number; color: Color }[] } & (
  | {
      type: 'linear'
      start: Vector
      end: Vector
    }
  | {
      type: 'radial'
      start: Vector
      startRadius: number
      end: Vector
      endRadius: number
    }
  | {
      type: 'conic'
      center: Vector
      startAngle: number
      end: Vector
    }
)

const Gradient = createToken(parser, (props: GradientProps) => {
  const internalContext = useInternalContext()

  const getGradient = () => {
    if (!internalContext) return
    const { ctx } = internalContext
    switch (props.type) {
      case 'linear':
        return ctx.createLinearGradient(
          props.start.x,
          props.start.y,
          props.end.x,
          props.end.y,
        )
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
        return ctx.createConicGradient(
          props.startAngle,
          props.center.x,
          props.center.y,
        )
    }
  }

  const color = () => {
    const gradient = getGradient()
    if (!gradient) return

    for (let { offset, color } of props.stops) {
      gradient.addColorStop(offset, resolveColor(color) ?? 'black')
    }

    return gradient
  }

  return {
    type: 'Color',
    color,
  }
})

export { Gradient }
