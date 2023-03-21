import { createToken } from '@solid-primitives/jsx-tokenizer'
import { Accessor, mergeProps } from 'solid-js'
import { useCanvas } from 'src/context'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import addVectors from 'src/utils/addVectors'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import transformPoint from 'src/utils/transformPoint'
import useBounds from 'src/utils/useBounds'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'

/**
 * Paints a quadratic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

type Point = { point: Position }

const Quadratic = createToken(
  parser,
  (
    props: ShapeProps & {
      points: [Point, Point & { control: Position }, ...((Point & { control: Position }) | Point)[]]
      close?: boolean
    },
  ) => {
    const canvas = useCanvas()
    const merged = mergeProps({ ...defaultShapeProps, close: false }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)

    const handles = useHandle(() => props.points, matrix)

    const bounds = useBounds(() => {
      return handles
        .points()
        .map(({ point, control, oppositeControl }, i) => {
          if (control && oppositeControl) {
            return [control, oppositeControl]
          }
          if (control) {
            return [point, control]
          }
          return [point]
        })
        .flat()
    }, matrix)

    const path = transformPath(() => {
      let point: Point | (Point & { control: Position }) | undefined = props.points[0]

      let svgString = `M${point?.point.x},${point?.point.y} `

      let i = 1
      while ((point = props.points[i])) {
        if (i === 1) svgString += 'Q'
        if (i === 2) svgString += 'T'
        if ('control' in point) {
          const control = addVectors(point.point, point.control)
          svgString += `${control.x},${control.y} ${point.point.x},${point.point.y} `
        } else {
          svgString += `${point.point.x},${point.point.y} `
        }
        i++
      }

      const path2D = new Path2D(svgString)
      if (merged.close) path2D.closePath()
      if (canvas) {
        canvas.ctx.strokeStyle = 'black'
        canvas.ctx.stroke(path2D)
      }

      return path2D
    }, matrix)

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!canvas) return
      canvas.ctx.save()
      renderPath(ctx, defaultBoundsProps, bounds().path)
      canvas.ctx.restore()
      handles.render()
      canvas.ctx.restore()
    }

    return {
      type: 'Shape',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => renderPath(ctx, merged, path()),
      debug,
      clip: ctx => ctx.clip(path()),
      path,
      hitTest: function (event) {
        if (!canvas) return false
        const token: ShapeToken = this
        return hitTest(token, event, canvas.ctx, merged, dragEventHandler)
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
  points: Accessor<{ point: Position; control?: Position }[]>,
  matrix: Accessor<DOMMatrix>,
) => {
  const canvas = useCanvas()
  let previousRelativeControl: Position
  const getAllPoints = () =>
    points()
      .map(({ point, control }, i) => {
        if (i === 0) {
          return { point }
        }

        if (!control) {
          // NOTE:  with the T-command it is possible to create smooth curves without defining control points

          //        from https://www.w3.org/TR/2015/WD-SVG2-20150709/paths.html#PathDataQuadraticBezierCommands
          //          Note that the control point for the "T" command is computed automatically
          //          as the reflection of the control point for the previous "Q" command relative
          //          to the start point of the "T" command.'
          control = {
            x: previousRelativeControl.x,
            y: previousRelativeControl.y * -1,
          }
        }

        previousRelativeControl = control

        if (i === points().length - 1) {
          return { point, control }
        }

        return {
          control,
          point,
          oppositeControl: {
            x: control.x * -1,
            y: control.y * -1,
          },
        }
      })
      .map(({ control, point, oppositeControl }, i) => ({
        point: point,
        control: control ? addVectors(point, control) : undefined,
        oppositeControl: oppositeControl ? addVectors(point, oppositeControl) : undefined,
      }))

  const renderPoint = (position: Position) => {
    if (!canvas) return
    canvas.ctx.save()
    canvas.ctx.beginPath()
    canvas.ctx.arc(position.x, position.y, 5, 0, 360)
    canvas.ctx.fillStyle = 'black'
    canvas.ctx.fill()
    canvas.ctx.closePath()
    canvas.ctx.restore()
  }

  const renderLine = (start: Position, end: Position) => {
    if (!canvas) return
    canvas.ctx.save()
    canvas.ctx.beginPath()
    canvas.ctx.strokeStyle = 'grey'

    canvas.ctx.moveTo(start.x, start.y)
    canvas.ctx.lineTo(end.x, end.y)
    canvas.ctx.stroke()
    canvas.ctx.closePath()
    canvas.ctx.restore()
  }

  const renderHandles = () => {
    if (!canvas) return
    let firstPoint: Position

    getAllPoints()
      .map(({ control, point, oppositeControl }, i) => ({
        point: transformPoint(point, matrix()),
        control: control ? transformPoint(control, matrix()) : undefined,
        oppositeControl: oppositeControl ? transformPoint(oppositeControl, matrix()) : undefined,
      }))
      .forEach(({ control, point, oppositeControl }, i) => {
        renderPoint(point)

        if (!firstPoint) firstPoint = point
        if (control) {
          if (i === 1) {
            renderLine(firstPoint, control)
          }
          renderLine(point, control)
          renderPoint(control)
        }
        if (oppositeControl) {
          renderPoint(oppositeControl)
          renderLine(point, oppositeControl)
        }
      })
  }

  return {
    render: renderHandles,
    points: getAllPoints,
  }
}

export { Quadratic }
