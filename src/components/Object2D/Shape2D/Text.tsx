import {
  createToken,
  TokenComponent,
  TokenElement,
} from '@solid-primitives/jsx-tokenizer'
import {
  Accessor,
  createEffect,
  createSignal,
  Show,
  splitProps,
} from 'solid-js'
import { Rectangle } from 'src'

import { Object2DToken, parser, StaticShape2D } from 'src/parser'
import {
  Dimensions,
  ExtendedColor,
  Object2DProps,
  Shape2DProps,
} from 'src/types'
import { createParenthood } from 'src/utils/createParenthood'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import { createControlledProps } from 'src/utils/createControlledProps'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'
import { Normalize } from 'src/utils/typehelpers'
import { RectangleProps } from './Path2D/Rectangle'

type Rounded =
  | number
  | [all: number]
  | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
  | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]

type TextProps = Shape2DProps & {
  text: string
  size?: number
  fontFamily?: string
  background?: ExtendedColor
  padding?: number
  /**
   * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
   */
  rounded?: Rounded
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
  (
    props: Shape2DProps & {
      text: string
      size?: number
      fontFamily?: string
      background?: ExtendedColor
      padding?: number
      /**
       * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
       */
      rounded?: Rounded
      isHovered?: boolean
      isSelected?: boolean
    },
  ) => {
    console.log('mounted text')

    const controlled = createControlledProps(
      resolveShape2DProps(props, {
        text: '',
      }),
    )

    const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })

    setTimeout(() => {
      context.ctx.font = getFontString(props.size, props.fontFamily)
      const metrics = context.ctx.measureText(props.text)
      setDimensions({
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent,
      })
    }, 0)

    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)

    const token: StaticShape2D = {
      props: controlled.props,
      type: 'StaticShape2D',
      id: 'Text',
      render: (ctx: CanvasRenderingContext2D) => {
        const offset = context.origin ?? { x: 0, y: 0 }
        if (props.text !== '') {
          ctx.font = getFontString(props.size, props.fontFamily)

          if (props.opacity) ctx.globalAlpha = props.opacity

          ctx.fillStyle = resolveExtendedColor(controlled.props.fill) ?? 'black'
          ctx.strokeStyle =
            resolveExtendedColor(controlled.props.stroke) ?? 'transparent'

          if (
            (props.isHovered || props.isSelected) &&
            controlled.props.hoverStyle
          ) {
            ctx.fillStyle =
              resolveExtendedColor(controlled.props.hoverStyle.fill) ??
              ctx.fillStyle
            ctx.strokeStyle =
              resolveExtendedColor(controlled.props.hoverStyle.stroke) ??
              ctx.strokeStyle
          }

          // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame
          if (ctx.fillStyle !== 'transparent')
            ctx.fillText(
              controlled.props.text,
              controlled.props.position.x + offset.x,
              controlled.props.position.y + offset.y + dimensions().height,
            )
          if (ctx.strokeStyle !== 'transparent')
            ctx.strokeText(
              controlled.props.text,
              controlled.props.position.x + offset.x,
              controlled.props.position.y + offset.y + dimensions().height,
            )
        }
        parenthood.render(ctx)
      },
    }
    return token
  },
)

export { Text }
