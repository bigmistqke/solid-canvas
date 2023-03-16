import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Dimensions } from 'src'
import { parser, Path2DToken } from 'src/parser'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import { defaultPath2DProps, Path2DProps } from '.'

const Rectangle = createToken(
  parser,
  (
    props: Path2DProps & {
      dimensions: Dimensions
    },
  ) => {
    const merged = mergeProps({ ...defaultPath2DProps, close: true }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const path = transformPath(merged, dragPosition, () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    })

    return {
      id: 'Rectangle',
      type: 'Path2D',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (event) {
        const token: Path2DToken = this
        return hitTest(token, event, merged, dragEventHandler)
      },
    }
  },
)

export { Rectangle }
