import { createToken } from '@solid-primitives/jsx-tokenizer'
import { Accessor, mergeProps } from 'solid-js'
import { useCanvas } from 'src/context'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import transformPoint from 'src/utils/transformPoint'
import useBounds from 'src/utils/useBounds'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'

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

    const matrix = useMatrix(merged, dragPosition)

    const handles = useHandle(() => props.points, matrix)

    const bounds = useBounds(
      () =>
        handles
          .points()
          .map(({ point, control, oppositeControl }) =>
            oppositeControl
              ? [
                  {
                    x: point.x + ((control.x - point.x) * 2) / 3,
                    y: point.y + ((control.y - point.y) * 2) / 3,
                  },
                  point,
                  {
                    x: point.x + ((oppositeControl.x - point.x) * 2) / 3,
                    y: point.y + ((oppositeControl.y - point.y) * 2) / 3,
                  },
                ]
              : [
                  {
                    x: point.x + ((control.x - point.x) * 2) / 3,
                    y: point.y + ((control.y - point.y) * 2) / 3,
                  },
                  point,
                ],
          )
          .flat(),
      matrix,
    )

    const path = transformPath(() => {
      let point = handles.points()[0]

      let svgString = `M${point?.point.x},${point?.point.y} C${point?.control.x},${point?.control.y} `

      let i = 1
      while ((point = handles.points()[i])) {
        if (i === 2) svgString += 'S'
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

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!context) return
      context.ctx.save()
      renderPath(ctx, defaultBoundsProps, bounds().path)
      context.ctx.restore()
      handles.render()
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

// NOTE:  I was exploring to use a hook for (editable) handles
//        but I am not sure if this is the right approach.

//        I feel that we should be able to write it more as userland
//        with draggable `<Line/>` and `<Arc/>`

//        maybe with an API like:
//          const Bezier = ...
//          export default (points) =>
//            <Controls points={points}>
//              (points) => <Bezier points={points}/>
//            </Controls>

//        but unsure how to design the API that `Controls` could work for all the Canvas-primitives
//          like `Line`, `Bezier`, `Quadratic`, ...

const useHandle = (
  points: Accessor<{ point: Position; control: Position }[]>,
  matrix: Accessor<DOMMatrix>,
) => {
  const context = useCanvas()

  const getAllPoints = () =>
    points().map(({ point, control }, i) =>
      i === 0 || i === points().length - 1
        ? { control, point }
        : { control, point, oppositeControl: getOppositeControl(point, control) },
    )

  const renderPoint = (position: Position) => {
    if (!context) return
    context.ctx.beginPath()
    context.ctx.arc(position.x, position.y, 5, 0, 360)
    context.ctx.fillStyle = 'black'
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

  const getOppositeControl = (point: Position, control: Position) => {
    const delta = {
      x: control.x - point.x,
      y: control.y - point.y,
    }
    return {
      x: point.x + delta.x * -1,
      y: point.y + delta.y * -1,
    }
  }

  const renderHandles = () => {
    if (!context) return
    getAllPoints().forEach(({ control, point, oppositeControl }, i) => {
      if (oppositeControl) {
        oppositeControl = transformPoint(oppositeControl, matrix())
        renderPoint(oppositeControl)
      }

      point = transformPoint(point, matrix())
      control = transformPoint(control, matrix())
      if (oppositeControl) renderLine(point, oppositeControl)

      renderLine(point, control)
      renderPoint(point)
      renderPoint(control)
    })
  }

  return {
    render: renderHandles,
    points: getAllPoints,
  }
}

export { Bezier }
