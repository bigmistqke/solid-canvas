import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createSignal, mergeProps } from 'solid-js'

import { ExtendedColor, Position, useCanvas } from 'src'
import { CanvasToken, parser } from 'src/parser'
import { getExtendedColor } from 'src/utils/getColor'
import {
  defaultPath2DProps,
  filterPath2DProps,
  isPointInShape,
  Path2DProps,
  transformPath,
} from './Path2D'

const Text = createToken(
  parser,
  (
    props: Path2DProps & {
      text: string
      size?: number
      fontFamily?: string
      background?: ExtendedColor
    },
  ) => {
    const context = useCanvas()

    const merged = mergeProps(
      { ...defaultPath2DProps, close: true, fontFamily: 'arial', size: 10 },
      props,
    )
    const filteredProps = filterPath2DProps(merged)

    const [textMetrics, setTextMetrics] = createSignal<TextMetrics>()

    const path = transformPath(merged, () => {
      const metrics = textMetrics()
      if (!metrics) return new Path2D()
      const {
        actualBoundingBoxAscent: ascent,
        actualBoundingBoxDescent: descent,
        actualBoundingBoxLeft: left,
        width,
      } = metrics
      const height = ascent + descent
      const path = new Path2D()

      path.rect(left * -1, (height + descent) * -1, width + left, height)
      return path
    })

    const render = (ctx: CanvasRenderingContext2D) => {
      const offset = context?.origin ?? { x: 0, y: 0 }
      ctx.font = '30px Arial'
      setTextMetrics(ctx.measureText(merged.text))
      if (merged.background) {
        const color = getExtendedColor(merged.background) ?? 'black'
        ctx.fillStyle = color
        ctx.fill(path())
        ctx.strokeStyle = color
        ctx.lineWidth = 5
        ctx.stroke(path())
      }
      ctx.fillStyle = 'black'
      ctx.fillText(merged.text, merged.position.x + offset.x, merged.position.y + offset.y)
    }

    return {
      props: filteredProps,
      type: 'Path2D',
      render,
      hitTest: function (event) {
        const hit = isPointInShape(event, path())
        if (hit) props[event.type]?.(event)
        if (hit) event.target.push(this as CanvasToken)
        return hit
      },
      clip: ctx => ctx.clip(path()),
      path,
    }
  },
)

export { Text }
