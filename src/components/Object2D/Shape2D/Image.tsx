import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser, Shape2DToken } from 'src/parser'
import { Dimensions, ExtendedColor, ImageSource, Shape2DProps } from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import { createControlledProps } from 'src/utils/createControlledProps'
import resolveImage from 'src/utils/resolveImageSource'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import { Normalize } from 'src/utils/typehelpers'

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
    const controlled = createControlledProps(
      mergeShape2DProps(props, {
        dimensions: {
          width: 10,
          height: 10,
        },
      }),
    )
    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)

    const image = resolveImage(() => props.image)

    const matrix = createMatrix(controlled.props)

    const path = createTransformedPath(() => {
      const path = new Path2D()
      path.rect(
        0,
        0,
        controlled.props.dimensions.width,
        controlled.props.dimensions.height,
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
          origin.x + controlled.props.position.x,
          origin.y + controlled.props.position.y,
          controlled.props.dimensions.width,
          controlled.props.dimensions.height,
        )

        parenthood.render(ctx)
        controlled.emit.onRender(ctx)
      },
      hitTest: event => {
        parenthood.hitTest(event)
        if (!event.propagation) return false
        controlled.emit.onHitTest(event)
        if (!event.propagation) return false
        const hit = hitTest(token, event, context, controlled.props)
        if (hit) {
          controlled.emit[event.type](event)
        }
        return hit
      },
      debug: () => {},
      path,
    }
    return token
  },
)

export { Image }
