import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createMemo, mapArray, mergeProps } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import hitTest from 'src/utils/hitTest'
import invertPosition from 'src/utils/invertPosition'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import { useBezierHandles } from 'src/utils/useHandles'
import useMatrix from 'src/utils/useMatrix'
import useProcessedPoints from 'src/utils/useProcessedPoints'
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

    const matrix = useMatrix(merged)
    const points = useProcessedPoints(() => props.points, 'quadratic')
    const handles = useBezierHandles(points, () => props.editable, 'quadratic')

    const bounds = useBounds(() => {
      return points()
        .map((point, i) => {
          let result: Position[] = [point.point]
          if (point.control) {
            const control = addPositions(point.point, point.control)
            const nextPoint = points()[i + 1]?.point
            if (nextPoint) {
              result.push(control, point.point)
            } else {
              result.push(point.point)
            }
          }
          return result
        })
        .flat()
    }, matrix)

    const path = useTransformedPath(() => {
      const values = points()

      let value = values[0]
      let point = value?.point
      let control = addPositions(value?.control, point)

      if (!point || !control) {
        return new Path2D()
      }

      let svg = `M${point.x},${point.y} Q${control.x},${control.y} `

      let i = 1

      while ((value = values[i])) {
        point = value.point as Position
        control = addPositions(value.control, point)

        if (i !== values.length - 1 && control) {
          svg += `${point.x},${point.y} ${control.x},${control.y} `
        } else {
          svg += `${point.x},${point.y} `
        }

        i++
      }

      const path2D = new Path2D(svg)

      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!canvas) return
      renderPath(ctx, defaultBoundsProps, bounds().path, canvas?.origin)
      canvas.ctx.restore()
    }

    return {
      type: 'Shape2D',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => {
        handles.render(ctx)
        renderPath(ctx, merged, path(), canvas?.origin)
      },
      debug,
      path,
      hitTest: function (event) {
        const token: Shape2DToken = this
        handles.hitTest(event)
        return hitTest(token, event, canvas, merged)
      },
    }
  },
)

const GroupedQuadratic = withGroup(Quadratic)

export { GroupedQuadratic as Quadratic, type QuadraticPoints }
