import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createSignal, mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { parser, ShapeToken } from 'src/parser'
import { ExtendedColor, Normalize, ShapeProps } from 'src/types'
import { defaultShapeProps } from 'src/utils/defaultProps'
import filterShapeProps from 'src/utils/filterShapeProps'
import hitTest from 'src/utils/hitTest'
import { resolveColor, resolveExtendedColor } from 'src/utils/resolveColor'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a text to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

type Rounded =
  | number
  | [all: number]
  | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
  | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]

const Text = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        text: string
        size?: number
        fontFamily?: string
        background?: ExtendedColor
        hover?: {
          background?: ExtendedColor
          fill?: ExtendedColor
          padding?: ExtendedColor
          rounded?: Rounded
        }
        padding?: number
        /**
         * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
         */
        rounded?: Rounded
      }
    >,
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps(
      {
        ...defaultShapeProps,
        close: true,
        fontFamily: 'arial',
        size: 10,
        fill: 'black',
        stroke: 'transparent',
        padding: 0,
      },
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

      if (props.rounded && 'roundRect' in path)
        path.roundRect(
          left * -1 - merged.padding,
          (height + descent) * -1 - merged.padding,
          width + left + merged.padding * 2,
          height + merged.padding * 2,
          props.rounded,
        )
      else
        path.rect(
          left * -1 - merged.padding,
          (height + descent) * -1 - merged.padding,
          width + left + merged.padding * 2,
          height + merged.padding * 2,
        )

      // path.rect(left * -1, (height + descent) * -1, width + left, height)
      return path
    }, matrix)

    const render = (ctx: CanvasRenderingContext2D) => {
      const offset = canvas?.origin ?? { x: 0, y: 0 }
      ctx.font = '30px Arial'
      setTextMetrics(ctx.measureText(merged.text))
      if (merged.background) {
        const color =
          (hover()
            ? resolveExtendedColor(merged.hover?.background ?? 'transparent')
            : resolveExtendedColor(merged.background) ?? 'transparent') ?? 'transparent'

        ctx.fillStyle = color
        ctx.fill(path())
        ctx.strokeStyle = color
        ctx.lineWidth = 5
        ctx.stroke(path())
      }
      if (props.opacity) ctx.globalAlpha = props.opacity
      ctx.fillStyle =
        (hover()
          ? resolveExtendedColor(merged.hover?.fill ?? 'black')
          : resolveExtendedColor(merged.fill) ?? 'black') ?? 'black'

      // resolveExtendedColor(merged.fill) ?? 'black'
      ctx.strokeStyle = resolveExtendedColor(merged.stroke) ?? 'transparent'
      // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame
      if (ctx.fillStyle !== 'transparent')
        ctx.fillText(merged.text, merged.position.x + offset.x, merged.position.y + offset.y)
      if (ctx.strokeStyle !== 'transparent')
        ctx.strokeText(merged.text, merged.position.x + offset.x, merged.position.y + offset.y)
    }

    const [hover, setHover] = createSignal(false)

    return {
      props: filteredProps,
      type: 'Shape',
      id: 'Text',
      render,
      hitTest: function (event) {
        const token: ShapeToken = this
        const hit = hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
        setHover(hit)
        return hit
      },
      path,
    }
  },
)

const GroupedText = withGroup(Text)

export { GroupedText as Text }
