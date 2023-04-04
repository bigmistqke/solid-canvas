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
import resolveImageSource from 'src/utils/resolveImageSource'

/**
 * Paints an image to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
 */

type ImageProps = {
  image: ImageSource
  dimensions?: Dimensions
  fontFamily?: string
  background?: ExtendedColor
}

const Image = createToken(
  parser,
  (props: Shape2DProps & Object2DProps & ImageProps) => {
    const image = resolveImageSource(() => props.image)
    const [context, setContext] = createSignal<InternalContextType>()

    const matrix = createMatrix(props, () => context()?.matrixValues)

    return createShape2D({
      props,
      id: 'Image',
      setup: (props, context) => {
        setContext(context)
      },
      render: (props, context) => {
        if (!image()) return
        if (props.opacity) context.ctx.globalAlpha = props.opacity
        context.ctx.setTransform(matrix())

        context.ctx.drawImage(
          image()!,
          context.matrixValues.e,
          context.matrixValues.f,
          props.dimensions.width,
          props.dimensions.height,
        )
      },
      get dimensions() {
        return (
          props.dimensions ?? {
            width: 100,
            height: 100,
          }
        )
      },
      defaultValues: {
        dimensions: {
          width: 100,
          height: 100,
        },
      },
    })
  },
)

export { Image }
