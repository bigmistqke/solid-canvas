import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import defaultShapeProps from 'src/utils/defaultShapeProps'
import filterShapeProps from 'src/utils/filterShapeProps'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Line = createToken(
  parser,
  (
    props: ShapeProps & {
      points: Position[]
      close: boolean
    },
  ) => {
    const merged = mergeProps({ ...defaultShapeProps, close: true }, props)
    const filteredProps = filterShapeProps(merged)
    const [dragPosition, dragEventHandler] = useDraggable()

    const path = transformPath(merged, dragPosition, () => {
      const result = new Path2D()
      let point = props.points[0]
      result.moveTo(point!.x, point!.y)
      let i = 0
      while ((point = props.points[i])) {
        result.lineTo(point.x, point.y)
        i++
      }
      if (merged.close) result.closePath()
      return result
    })

    return {
      type: 'Shape',
      id: 'Line',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (this: ShapeToken, event) {
        return hitTest(this, event, merged, dragEventHandler)
      },
    }
  },
)

export { Line }