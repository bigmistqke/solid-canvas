import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, mergeProps } from 'solid-js'

import { parser, Shape2DToken } from 'src/parser'
import { Shape2DProps, Dimensions, Normalize } from 'src/types'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import useBounds from 'src/utils/useBounds'
import useMatrix from 'src/utils/useMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useTransformedPath from 'src/utils/useTransformedPath'
import useDraggable from 'src/utils/useDraggable'
import { useInternalContext } from 'src/context/InternalContext'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Arc = createToken(
  parser,
  (
    props: Normalize<
      Shape2DProps & {
        radius?: number
        angle?: {
          start: number
          end: number
        }
      }
    >,
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps(
      { ...defaultShape2DProps, close: true, radius: 10, angle: { start: 0, end: 2 * Math.PI } },
      props,
    )
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)

    const getPath = () => {
      const path = new Path2D()
      path.arc(merged.radius, merged.radius, merged.radius, merged.angle.start, merged.angle.end)
      return path
    }

    const path = useTransformedPath(getPath, matrix)

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

    let token: Shape2DToken
    return {
      id: 'Arc',
      type: 'Shape2D',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      path,
      hitTest: function (event) {
        token = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
    }
  },
)
const GroupedArc = withGroup(Arc)

export { GroupedArc as Arc }
