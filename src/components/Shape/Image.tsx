import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { useCanvas } from 'src'

import { parser, ShapeToken } from 'src/parser'
import { Normalize, ShapeProps, ImageSource, Dimensions, ExtendedColor } from 'src/types'
import defaultShapeProps from 'src/utils/defaultShapeProps'
import filterShapeProps from 'src/utils/filterShapeProps'
import hitTest from 'src/utils/hitTest'
import resolveImage from 'src/utils/resolveImageSource'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'

/**
 * Paints an image to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
 */

const Image = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        image: ImageSource
        dimensions?: Dimensions
        fontFamily?: string
        background?: ExtendedColor
      }
    >,
  ) => {
    const context = useCanvas()
    const merged = mergeProps(
      {
        ...defaultShapeProps,
        close: true,
        fontFamily: 'arial',
        size: 10,
        dimensions: { width: 100, height: 100 },
      },
      props,
    )
    const filteredProps = filterShapeProps(merged)

    const [dragPosition, dragEventHandler] = useDraggable()

    const image = resolveImage(() => props.image)

    const path = transformPath(merged, dragPosition, () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    })

    const render = (ctx: CanvasRenderingContext2D) => {
      const img = image()
      if (!img) return

      const origin = context?.origin ?? { x: 0, y: 0 }

      ctx.drawImage(
        img,
        origin.x + merged.position.x + dragPosition().x,
        origin.y + merged.position.y + dragPosition().y,
        merged.dimensions.width,
        merged.dimensions.height,
      )
    }

    return {
      props: filteredProps,
      type: 'Shape',
      id: 'Image',
      render,
      hitTest: function (event) {
        return hitTest(this as ShapeToken, event, merged, dragEventHandler)
      },
      clip: ctx => ctx.clip(path()),
      path,
    }
  },
)

export { Image }
