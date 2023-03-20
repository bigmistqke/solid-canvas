import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, mergeProps } from 'solid-js'

import { parser, ShapeToken } from 'src/parser'
import { ShapeProps, Dimensions, Normalize } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import useBounds from 'src/utils/useBounds'
import useMatrix from 'src/utils/useMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Arc = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        radius?: number
        angle?: {
          start: number
          end: number
        }
      }
    >,
  ) => {
    const merged = mergeProps(
      { ...defaultShapeProps, close: true, radius: 10, angle: { start: 0, end: 2 * Math.PI } },
      props,
    )
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)

    const getPath = () => {
      const path = new Path2D()
      path.arc(0, 0, merged.radius, merged.angle.start, merged.angle.end)
      return path
    }

    const path = transformPath(getPath, matrix)

    const bounds = useBounds(
      () => [
        {
          x: merged.radius * -1,
          y: merged.radius * -1,
        },
        {
          x: merged.radius * 1,
          y: merged.radius * -1,
        },
        {
          x: merged.radius * 1,
          y: merged.radius * 1,
        },
        {
          x: merged.radius * -1,
          y: merged.radius * 1,
        },
      ],
      matrix,
    )

    return {
      id: 'Arc',
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

export { Arc }
