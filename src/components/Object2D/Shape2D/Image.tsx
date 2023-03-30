import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken, StaticShape2D } from 'src/parser'
import { Dimensions, ExtendedColor, ImageSource, Shape2DProps } from 'src/types'
import filterShape2DProps from 'src/utils/filterShape2DProps'
import hitTest from 'src/utils/hitTest'
import resolveImage from 'src/utils/resolveImageSource'
import { Normalize } from 'src/utils/typehelpers'
import { createMatrix } from 'src/utils/createMatrix'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import withGroup from 'src/utils/withGroup'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'
import { createParenthood } from 'src/utils/createParenthood'

/**
 * Paints an image to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
 */

const Image = createToken(
  parser,
  (
    props: Normalize<
      Shape2DProps & {
        image: ImageSource
        dimensions?: Dimensions
        fontFamily?: string
        background?: ExtendedColor
      }
    >,
  ) => {
    const resolvedProps = resolveShape2DProps(props, {
      close: true,
      fontFamily: 'arial',
      size: 10,
      dimensions: { width: 100, height: 100 },
    })
    const context = createUpdatedContext(resolvedProps)
    const parenthood = createParenthood(resolvedProps)
    const image = resolveImage(() => props.image)

    const matrix = createMatrix(resolvedProps)

    const path = createTransformedPath(() => {
      const path = new Path2D()
      path.rect(
        0,
        0,
        resolvedProps.dimensions.width,
        resolvedProps.dimensions.height,
      )
      return path
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Image',
      render: ctx => {
        const img = image()
        if (!img) return

        const origin = context.origin ?? { x: 0, y: 0 }
        if (props.opacity) ctx.globalAlpha = props.opacity
        ctx.drawImage(
          img,
          origin.x + resolvedProps.position.x,
          origin.y + resolvedProps.position.y,
          resolvedProps.dimensions.width,
          resolvedProps.dimensions.height,
        )

        parenthood.render(ctx)
      },
      hitTest: event => hitTest(token, event, context, resolvedProps),
      debug: () => {},
      path,
    }
    return token
  },
)

export { Image }
