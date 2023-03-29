import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { createBounds } from 'src/utils/createBounds'
import { createBezierHandles } from 'src/utils/createHandles'
import { createMatrix } from 'src/utils/createMatrix'
import { createProcessedPoints } from 'src/utils/createProcessedPoints'
import { createTransformedPath } from 'src/utils/createTransformedPath'
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

    const matrix = createMatrix(merged)
    const points = createProcessedPoints(() => props.points, 'quadratic')
    const handles = createBezierHandles(
      points,
      () => props.editable,
      'quadratic',
    )

    const bounds = createBounds(() => {
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

    const path = createTransformedPath(() => {
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

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Bezier',
      path,
      render: ctx => {
        renderPath(
          ctx,
          merged,
          path(),
          canvas?.origin,
          canvas?.isHovered(token) || canvas?.isSelected(token),
        )
        handles.render(ctx)
      },
      debug: ctx =>
        renderPath(
          ctx,
          defaultBoundsProps,
          bounds().path,
          canvas?.origin,
          false,
        ),
      hitTest: event => {
        handles.hitTest(event)
        return hitTest(token, event, canvas, merged)
      },
    }
    return token
  },
)

const GroupedQuadratic = withGroup(Quadratic)

export { GroupedQuadratic as Quadratic, type QuadraticPoints }
