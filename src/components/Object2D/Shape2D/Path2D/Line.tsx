import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
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
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Line = createToken(
  parser,
  (
    props: Shape2DProps & {
      points: Position[]
      close?: boolean
    },
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShape2DProps, close: false }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)
    const bounds = useBounds(() => props.points, matrix)

    const path = useTransformedPath(() => {
      // calculate path
      const path2D = new Path2D()
      let point = props.points[0]
      path2D.moveTo(point!.x, point!.y)
      let i = 0
      while ((point = props.points[i])) {
        path2D.lineTo(point.x, point.y)
        i++
      }
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    return {
      type: 'Shape2D',
      id: 'Line',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      path,
      hitTest: function (event) {
        const token: Shape2DToken = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
    }
  },
)

const GroupedLine = withGroup(Line)

export { GroupedLine as Line }
