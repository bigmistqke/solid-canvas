import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createSignal, mergeProps } from 'solid-js'

import { useCanvas } from 'src'
import { parser, ShapeToken } from 'src/parser'
import { ExtendedColor, Normalize, ShapeProps } from 'src/types'
import { defaultShapeProps } from 'src/utils/defaultProps'
import filterShapeProps from 'src/utils/filterShapeProps'
import hitTest from 'src/utils/hitTest'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'

/**
 * Paints a text to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

const Text = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        text: string
        size?: number
        fontFamily?: string
        background?: ExtendedColor
      }
    >,
  ) => {
    const canvas = useCanvas()
    const merged = mergeProps(
      { ...defaultShapeProps, close: true, fontFamily: 'arial', size: 10 },
      props,
    )
    const filteredProps = filterShapeProps(merged)

    const [dragPosition, dragEventHandler] = useDraggable()

    const [textMetrics, setTextMetrics] = createSignal<TextMetrics>()
    const matrix = useMatrix(merged, dragPosition)

    const path = transformPath(() => {
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
    }, matrix)

    const render = (ctx: CanvasRenderingContext2D) => {
      const offset = canvas?.origin ?? { x: 0, y: 0 }
      ctx.font = '30px Arial'
      setTextMetrics(ctx.measureText(merged.text))
      if (merged.background) {
        const color = resolveExtendedColor(merged.background) ?? 'black'
        ctx.fillStyle = color
        ctx.fill(path())
        ctx.strokeStyle = color
        ctx.lineWidth = 5
        ctx.stroke(path())
      }
      ctx.fillStyle = 'black'
      // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame
      ctx.fillText(merged.text, merged.position.x + offset.x, merged.position.y + offset.y)
    }

    return {
      props: filteredProps,
      type: 'Shape',
      id: 'Text',
      render,
      hitTest: function (event) {
        const token: ShapeToken = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
      clip: ctx => ctx.clip(path()),
      path,
    }
  },
)

export { Text }
