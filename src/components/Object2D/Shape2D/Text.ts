import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createSignal } from 'solid-js'

import { parser } from 'src/parser'
import {
  Dimensions,
  ExtendedColor,
  Object2DProps,
  Shape2DProps,
} from 'src/types'
import { createShape2D } from 'src/utils/createShape2D'
import { resolveExtendedColor } from 'src/utils/resolveColor'

type Rounded =
  | number
  | [all: number]
  | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
  | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]

type TextProps = Shape2DProps & {
  style?: {
    background?: ExtendedColor
    rounded?: Rounded
    padding?: number
    fontSize?: number
    fontFamily?: string
    '&:hover'?: {
      background?: ExtendedColor
      rounded?: Rounded
      padding?: number
      fontSize?: number
      fontFamily?: string
    }
  }
  text: string
  /**
   * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
   */
  isHovered?: boolean
  isSelected?: boolean
}

const getFontString = (size?: number, fontFamily?: string) =>
  `${size ?? 10}pt ${fontFamily ?? 'Arial'}`

/**
 * Paints a text to the context
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

const Text = createToken(
  parser,
  (props: Shape2DProps & Object2DProps & TextProps) => {
    const [dimensions, setDimensions] = createSignal<Dimensions | undefined>()

    return createShape2D({
      id: 'Text',
      render: (props, context) => {
        if (props.text !== '') {
          context.ctx.font = getFontString(
            props.style?.fontSize,
            props.style?.fontFamily,
          )

          if (props.opacity) context.ctx.globalAlpha = props.opacity

          context.ctx.fillStyle =
            resolveExtendedColor(props.style?.fill) ?? 'black'
          context.ctx.strokeStyle =
            resolveExtendedColor(props.stroke) ?? 'transparent'

          if ((props.isHovered || props.isSelected) && props.hoverStyle) {
            context.ctx.fillStyle =
              resolveExtendedColor(props.hoverStyle.fill) ??
              context.ctx.fillStyle
            context.ctx.strokeStyle =
              resolveExtendedColor(props.hoverStyle.stroke) ??
              context.ctx.strokeStyle
          }

          // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame          context.ctx.resetTransform()
          if (
            context.ctx.fillStyle &&
            context.ctx.fillStyle !== 'transparent'
          ) {
            context.ctx.fillText(
              props.text,
              context.matrix.e,
              context.matrix.f + dimensions()!.height,
            )
          }
          if (
            context.ctx.strokeStyle &&
            context.ctx.strokeStyle !== 'transparent'
          )
            context.ctx.strokeText(
              props.text,
              context.matrix.e,
              context.matrix.f + dimensions()!.height,
            )
        }
      },
      props,
      defaultValues: {
        text: '',
        stroke: undefined,
        padding: 0,
        background: undefined,
      },
      setup: (props, context) => {
        setTimeout(() => {
          context.ctx.font = getFontString(
            props.style?.fontSize,
            props.style?.fontFamily,
          )
          const metrics = context.ctx.measureText(props.text)
          setDimensions({
            width: metrics.width,
            height: metrics.actualBoundingBoxAscent,
          })
        }, 0)
      },
      get dimensions() {
        return dimensions()
      },
    })
  },
)

export { Text }
