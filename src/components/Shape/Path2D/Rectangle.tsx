import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, mergeProps } from 'solid-js'

import { parser, ShapeToken } from 'src/parser'
import { ShapeProps, Dimensions, Normalize } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import getBounds from 'src/utils/getBounds'
import getMatrix from 'src/utils/getMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Rectangle = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        dimensions: Dimensions
      }
    >,
  ) => {
    const merged = mergeProps({ ...defaultShapeProps, close: true }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = getMatrix(merged, dragPosition)

    const getPath = () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    }

    const path = transformPath(getPath, matrix)

    const bounds = getBounds(
      () => [
        {
          x: 0,
          y: 0,
        },
        {
          x: props.dimensions.width,
          y: 0,
        },
        {
          x: props.dimensions.width,
          y: props.dimensions.height,
        },
        {
          x: 0,
          y: props.dimensions.height,
        },
      ],
      matrix,
    )

    return {
      id: 'Rectangle',
      type: 'Shape',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (event) {
        const token: ShapeToken = this
        return hitTest(token, event, merged, dragEventHandler)
      },
    }
  },
)

export { Rectangle }
