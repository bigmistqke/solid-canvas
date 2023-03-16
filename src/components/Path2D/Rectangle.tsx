import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Dimensions } from 'src'
import { parser, Path2DToken } from 'src/parser'
import {
  defaultPath2DProps,
  hitTest,
  Path2DProps,
  renderPath,
  transformPath,
  useDraggable,
} from '.'

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
      type: 'Path2D',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (event) {
        const self: Path2DToken = this
        return hitTest(self, event, merged, dragEventHandler)
      },
    }
  },
)

export { Rectangle }
