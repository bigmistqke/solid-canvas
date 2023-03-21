import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import useBounds from 'src/utils/useBounds'
import useMatrix from 'src/utils/useMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import { useCanvas } from 'src/context'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Line = createToken(
  parser,
  (
    props: ShapeProps & {
      points: Position[]
      close?: boolean
    },
  ) => {
    const canvas = useCanvas()
    const merged = mergeProps({ ...defaultShapeProps, close: true }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)
    const bounds = useBounds(() => props.points, matrix)

    const path = transformPath(() => {
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
      type: 'Shape',
      id: 'Line',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      path,
      hitTest: function (event) {
        const token: ShapeToken = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
    }
  },
)

const GroupedLine = withGroup(Line)

export { GroupedLine as Line }
