import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Position } from 'src'
import { CanvasToken, parser, Path2DToken } from 'src/parser'
import hitTest from 'src/utils/hitTest'
import { isPointInShape } from 'src/utils/isPointInShape'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import { defaultPath2DProps, filterPath2DProps, Path2DProps } from '.'

const Line = createToken(
  parser,
  (
    props: Path2DProps & {
      points: Position[]
      close: boolean
    },
  ) => {
    const merged = mergeProps({ ...defaultPath2DProps, close: true }, props)
    const filteredProps = filterPath2DProps(merged)
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
      type: 'Path2D',
      id: 'Line',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (this: Path2DToken, event) {
        return hitTest(this, event, merged, dragEventHandler)
      },
    }
  },
)

export { Line }
