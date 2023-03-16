import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Dimensions, useCanvas } from 'src'
import { CanvasToken, parser } from 'src/parser'
import {
  defaultPath2DProps,
  filterPath2DProps,
  isPointInShape,
  Path2DProps,
  renderPath,
  transformPath,
} from '.'

const Rectangle = createToken(
  parser,
  (
    props: Path2DProps & {
      dimensions: Dimensions
    },
  ) => {
    const merged = mergeProps({ ...defaultPath2DProps, close: true }, props)

    const path = transformPath(merged, () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    })

    return {
      type: 'Path2D',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      clip: ctx => ctx.clip(path()),
      hitTest: function (event) {
        const hit = isPointInShape(event, path())
        if (hit) props[event.type]?.(event)
        if (hit) event.target.push(this as CanvasToken)
        return hit
      },
    }
  },
)

export { Rectangle }
