import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Dimensions, ExtendedColor, ImageSource, useCanvas } from 'src'
import { parser, Path2DToken } from 'src/parser'
import hitTest from 'src/utils/hitTest'
import resolveImage from 'src/utils/resolveImageSource'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import { defaultPath2DProps, filterPath2DProps, Path2DProps } from './Path2D'

const Image = createToken(
  parser,
  (
    props: Path2DProps & {
      image: ImageSource
      dimensions?: Dimensions
      fontFamily?: string
      background?: ExtendedColor
    },
  ) => {
    const context = useCanvas()
    const merged = mergeProps(
      {
        ...defaultPath2DProps,
        close: true,
        fontFamily: 'arial',
        size: 10,
        dimensions: { width: 100, height: 100 },
      },
      props,
    )
    const filteredProps = filterPath2DProps(merged)

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
      type: 'Path2D',
      id: 'Image',
      render,
      hitTest: function (event) {
        return hitTest(this as Path2DToken, event, merged, dragEventHandler)
      },
      clip: ctx => ctx.clip(path()),
      path,
    }
  },
)

export { Image }
