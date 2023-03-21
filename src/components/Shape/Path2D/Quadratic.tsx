import { createToken } from '@solid-primitives/jsx-tokenizer'
import { Accessor, mergeProps } from 'solid-js'
import { useCanvas } from 'src/context'

import { parser, ShapeToken } from 'src/parser'
import { Position, ShapeProps } from 'src/types'
import addVectors from 'src/utils/addVectors'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import hitTest from 'src/utils/hitTest'
import renderLine from 'src/utils/renderLine'
import renderPath from 'src/utils/renderPath'
import renderPoint from 'src/utils/renderPoint'
import transformPath from 'src/utils/transformPath'
import transformPoint from 'src/utils/transformPoint'
import useBounds from 'src/utils/useBounds'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a quadratic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

type Point = { point: Position }

type QuadraticPoints = [
  Point,
  Point & { control: Position },
  ...((Point & { control: Position }) | Point)[],
]

const Quadratic = createToken(
  parser,
  (
    props: ShapeProps & {
      points: QuadraticPoints
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
        .map(({ control, point, oppositeControl }) => {
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
      path,
      hitTest: function (event) {
        const token: ShapeToken = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
    }
  },
)

const GroupedQuadratic = withGroup(Quadratic)

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
  let previousControl: Position
  const getAllPoints = () =>
    points().map(({ point, control }, i) => {
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
          x: previousControl.x - point.x,
          y: previousControl.y - point.y,
        }
      }

      if (i === points().length - 1) {
        return { point, control: addVectors(control, point) }
      }

      const oppositeControl = addVectors(
        {
          x: control.x * -1,
          y: control.y * -1,
        },
        point,
      )

      previousControl = oppositeControl

      return {
        point,
        control: addVectors(control, point),
        oppositeControl,
      }
    })

  const renderHandles = () => {
    if (!canvas) return
    let firstPoint: Position

    getAllPoints()
      .map(({ control, point, oppositeControl }) => ({
        point: transformPoint(point, matrix()),
        control: control ? transformPoint(control, matrix()) : undefined,
        oppositeControl: oppositeControl ? transformPoint(oppositeControl, matrix()) : undefined,
      }))
      .forEach(({ control, point, oppositeControl }, i) => {
        renderPoint(canvas.ctx, point)
        if (!firstPoint) firstPoint = point
        if (control) {
          if (i === 1) renderLine(canvas.ctx, firstPoint, control)
          renderLine(canvas.ctx, point, control)
          renderPoint(canvas.ctx, control)
        }
        if (oppositeControl) {
          renderPoint(canvas.ctx, oppositeControl)
          renderLine(canvas.ctx, point, oppositeControl)
        }
      })
  }

  return {
    render: renderHandles,
    points: getAllPoints,
  }
}

export { GroupedQuadratic as Quadratic, type QuadraticPoints }
