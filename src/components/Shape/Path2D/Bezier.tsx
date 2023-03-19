import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { useCanvas } from 'src/context'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import getBounds from 'src/utils/getBounds'
import getMatrix from 'src/utils/getMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import transformPoint from 'src/utils/transformPoint'
import useDraggable from 'src/utils/useDraggable'

/**
 * Paints a cubic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

const Bezier = createToken(
  parser,
  (
    props: ShapeProps & {
      points: { point: Position; control: Position }[]
      close?: boolean
    },
  ) => {
    const context = useCanvas()
    const merged = mergeProps({ ...defaultShapeProps, close: false }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = getMatrix(merged, dragPosition)
    const bounds = getBounds(
      () => props.points.map(({ point, control }) => [control, point]).flat(),
      matrix,
    )

    const path = transformPath(() => {
      let point = props.points[0]

      let svgString = `M${point?.point.x},${point?.point.y} C${point?.control.x},${point?.control.y} `

      let i = 1
      while ((point = props.points[i])) {
        svgString += `${point?.control.x},${point?.control.y} ${point?.point.x},${point?.point.y} `
        i++
      }
      const path2D = new Path2D(svgString)
      if (merged.close) path2D.closePath()
      if (context) {
        context.ctx.strokeStyle = 'black'
        context.ctx.stroke(path2D)
      }
      return path2D
    }, matrix)

    const renderPoint = (position: Position) => {
      if (!context) return
      context.ctx.beginPath()
      context.ctx.arc(position.x, position.y, 5, 0, 360)
      context.ctx.fill()
      context.ctx.closePath()
    }

    const renderLine = (start: Position, end: Position) => {
      if (!context) return
      context.ctx.beginPath()
      context.ctx.moveTo(start.x, start.y)
      context.ctx.lineTo(end.x, end.y)
      context.ctx.stroke()
      context.ctx.closePath()
    }

    const renderHandles = () => {
      if (!context) return
      props.points.forEach(({ control, point }) => {
        point = transformPoint(point, matrix())
        control = transformPoint(control, matrix())
        renderLine(point, control)
        renderPoint(point)
        renderPoint(control)
      })
    }

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!context) return
      context.ctx.save()
      renderPath(ctx, defaultBoundsProps, bounds())
      context.ctx.restore()
      renderHandles()
      context.ctx.restore()
    }

    return {
      type: 'Shape',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug,
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (this: ShapeToken, event) {
        return hitTest(this, event, merged, dragEventHandler)
      },
    }
  },
)

export { Bezier }
