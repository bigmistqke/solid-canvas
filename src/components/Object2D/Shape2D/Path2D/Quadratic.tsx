import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createSignal, mergeProps } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addVectors'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import useControls from 'src/utils/useControls'
import useMatrix from 'src/utils/useMatrix'
import useTransformedPath from 'src/utils/useTransformedPath'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a quadratic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

type QuadraticPoints = { point: Position; control?: Position }[]

const Quadratic = createToken(
  parser,
  (
    props: Shape2DProps & {
      points: QuadraticPoints
      close?: boolean
    },
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShape2DProps, close: false }, props)

    const getAllPoints = () => {
      let previousControl: Position | undefined = undefined
      let oppositeControl: Position

      return props.points.map(({ point, control }, i) => {
        control = control ?? {
          x: (previousControl!.x - point.x) * -1,
          y: (previousControl!.y - point.y) * -1,
        }

        oppositeControl = {
          x: control.x * -1,
          y: control.y * -1,
        }

        previousControl = addPositions(control, point)

        if (i === props.points.length - 1) {
          return { point, oppositeControl }
        }

        if (i === 0) {
          return { point, control }
        }

        return {
          point,
          control,
          oppositeControl,
        }
      })
    }

    const matrix = useMatrix(merged)
    const controls = useControls({
      ...merged,
      get points() {
        return getAllPoints()
      },
    })

    const bounds = useBounds(() => {
      return props.points
        .map(point => {
          if ('control' in point && point.control) {
            return [point.control, point.point]
          }
          return [point.point]
        })
        .flat()
    }, matrix)

    const path = useTransformedPath(() => {
      const values = getAllPoints()

      const offsets = controls.offsets()

      let value = values[0]
      let offset = offsets[0]
      let point = addPositions(value?.point, offset?.point)
      let control = addPositions(offset?.point, offset?.control, value?.control)

      if (!point || !offset || !control) {
        console.error('incorrect path')
        return new Path2D()
      }

      let svg = `M${point.x},${point.y} Q${control.x},${control.y} `

      let i = 1

      while ((value = values[i])) {
        offset = offsets[i]
        point = addPositions(offset?.point, value.point)
        control = addPositions(value.point, offset?.point, offset?.control, value.control)

        if (!offset || !control || !point) {
          console.error('incorrect path')
          return new Path2D()
        }

        if (i !== values.length - 1 && 'control' in value && 'control' in offset) {
          svg += `${point.x},${point.y} ${control.x},${control.y} `
        } else {
          svg += `${point.x},${point.y} `
          if (i !== values.length - 1) {
            svg += 'T '
          }
        }

        i++
      }

      const path2D = new Path2D(svg)
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!canvas) return
      canvas.ctx.save()
      renderPath(ctx, defaultBoundsProps, bounds().path)
      canvas.ctx.restore()
      canvas.ctx.restore()
    }

    return {
      type: 'Shape2D',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => {
        renderPath(ctx, merged, path())
        controls.render(ctx)
      },
      debug,
      path,
      hitTest: function (event) {
        const token: Shape2DToken = this
        controls.hitTest(event)
        return hitTest(token, event, canvas?.ctx, merged)
      },
    }
  },
)

const GroupedQuadratic = withGroup(Quadratic)

// NOTE:  I was exploring to use a hook for (editable) controls
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

/* const useHandle = (
  points: Accessor<{ point: Position; control?: Position }[]>,
  matrix: Accessor<DOMMatrix>,
) => {
  const canvas = useInternalContext()
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
        return { point, control: addPositions(control, point) }
      }

      const oppositeControl = addPositions(
        {
          x: control.x * -1,
          y: control.y * -1,
        },
        point,
      )

      previousControl = oppositeControl

      return {
        point,
        control: addPositions(control, point),
        oppositeControl,
      }
    })

  const renderControls = () => {
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
    render: renderControls,
    points: getAllPoints,
  }
}
 */
export { GroupedQuadratic as Quadratic, type QuadraticPoints }