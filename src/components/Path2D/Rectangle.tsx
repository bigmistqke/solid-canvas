import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createSignal, mergeProps, onCleanup } from 'solid-js'

import { Dimensions, useCanvas } from 'src'
import { CanvasMouseEvent, CanvasToken, parser } from 'src/parser'
import {
  defaultPath2DProps,
  isPointInShape,
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
        const hit = isPointInShape(event, path())
        if (hit) props[event.type]?.(event)
        if (hit && props.draggable) dragEventHandler(event)
        if (hit) event.target.push(this as CanvasToken)
        return hit
      },
    }
  },
)

export { Rectangle }
