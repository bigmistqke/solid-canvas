import { createToken } from '@solid-primitives/jsx-tokenizer'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import { createBounds } from 'src/utils/createBounds'
import { createBezierHandles } from 'src/utils/createHandles'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createProcessedPoints } from 'src/utils/createProcessedPoints'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { createControlledProps } from 'src/utils/createControlledProps'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'

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
    const controlled = createControlledProps(
      resolveShape2DProps(props, { close: false }),
    )

    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)

    const mutablePoints = createProcessedPoints(() => props.points, 'quadratic')

    const matrix = createMatrix(controlled.props)
    const path = createTransformedPath(() => {
      const values = mutablePoints()

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

      if (controlled.props().close) path2D.closePath()

      return path2D
    }, matrix)

    const handles = createBezierHandles(
      mutablePoints,
      () => props.editable,
      'quadratic',
    )

    const bounds = createBounds(() => {
      return mutablePoints()
        .map((point, i) => {
          let result: Position[] = [point.point]
          if (point.control) {
            const control = addPositions(point.point, point.control)
            const nextPoint = mutablePoints()[i + 1]?.point
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

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Bezier',
      path,
      render: ctx => {
        renderPath(
          ctx,
          controlled.props(),
          path(),
          context.origin,
          context.isHovered(token) || context.isSelected(token),
        )
        handles.render(ctx)
        parenthood.render(ctx)
      },
      debug: ctx =>
        renderPath(
          ctx,
          defaultBoundsProps,
          bounds().path,
          context.origin,
          false,
        ),
      hitTest: event => {
        handles.hitTest(event)
        return hitTest(token, event, context, controlled.props())
      },
    }
    return token
  },
)

export { Quadratic, type QuadraticPoints }
