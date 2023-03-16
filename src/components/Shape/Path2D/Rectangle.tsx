import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { parser, ShapeToken } from 'src/parser'
import { ShapeProps, Dimensions, Normalize } from 'src/types'
import defaultShapeProps from 'src/utils/defaultShapeProps'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'

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

    const path = transformPath(merged, dragPosition, () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    })

    return {
      id: 'Rectangle',
      type: 'Shape',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
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
