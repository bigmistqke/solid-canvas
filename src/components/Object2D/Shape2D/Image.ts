import { createToken } from '@solid-primitives/jsx-tokenizer'

import { createSignal } from 'solid-js'
import { InternalContextType } from 'src/context/InternalContext'
import { parser } from 'src/parser'
import {
  Dimensions,
  ExtendedColor,
  ImageSource,
  Object2DProps,
  Shape2DProps,
} from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createShape2D } from 'src/utils/createShape2D'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import resolveImageSource from 'src/utils/resolveImageSource'

/**
 * Paints an image to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
 */

type ImageProps = {
  image: ImageSource
  style: {
    dimensions?: Dimensions
    background?: ExtendedColor
  }
}

const Image = createToken(
  parser,
  (props: Shape2DProps & Object2DProps & ImageProps) => {
    const image = resolveImageSource(() => props.image)

    return createShape2D({
      props,
      id: 'Image',
      setup: (props, context) => {
        // setContext(context)
      },
      render: (props, context) => {
        if (!image()) return
        if (props.opacity) context.ctx.globalAlpha = props.opacity
        context.ctx.setTransform(context.matrix)

        context.ctx.drawImage(
          image()!,
          0,
          0,
          props.style.dimensions?.width ?? 0,
          props.style.dimensions?.height ?? 0,
        )
        context.ctx.resetTransform()
      },
      get dimensions() {
        return (
          props.style?.dimensions ?? {
            width: 100,
            height: 100,
          }
        )
      },
      defaultValues: {
        style: {
          dimensions: {
            width: 100,
            height: 100,
          },
        },
      },
    })
  },
)

export { Image }
