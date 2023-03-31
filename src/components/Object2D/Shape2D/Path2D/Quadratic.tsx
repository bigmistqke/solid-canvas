import { createToken } from '@solid-primitives/jsx-tokenizer'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, ResolvedShape2DProps, Shape2DProps } from 'src/types'
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
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import { createQuadratic } from 'src/d'
import { createDebugSvg } from 'src/utils/createDebugSvg'

/**
 * Paints a quadratic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

type QuadraticPoints = { point: Position; control?: Position }[]

export type QuadraticProps = {
  points: QuadraticPoints
  close?: boolean
}

const Quadratic = createToken(
  parser,
  (props: Shape2DProps<QuadraticProps> & QuadraticProps) => {
    const controlled = createControlledProps(
      mergeShape2DProps(props, {
        close: false,
        points: [],
      }) as ResolvedShape2DProps & QuadraticProps,
    )

    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)
    const matrix = createMatrix(controlled.props)

    const path = createTransformedPath(() => {
      const svg = createQuadratic(controlled.props.points).string

      const path2D = new Path2D(svg)
      if (controlled.props.close) path2D.closePath()
      return path2D
    }, matrix)

    const bounds = createBounds(() => {
      return controlled.props.points
        .map((point, i) => {
          let result: Position[] = [point.point]
          if (point.control) {
            const control = addPositions(point.point, point.control)
            const nextPoint = controlled.props.points[i + 1]?.point
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
          controlled.props,
          path(),
          context.origin,
          context.isHovered(token) || context.isSelected(token),
        )
        parenthood.render(ctx)
        controlled.emit.onRender(ctx)
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
        parenthood.hitTest(event)
        if (!event.propagation) return false
        controlled.emit.onHitTest(event)
        if (!event.propagation) return false
        const hit = hitTest(token, event, context, controlled.props)
        if (hit) {
          controlled.emit[event.type](event)
        }
        return hit
      },
    }
    return token
  },
)

export { Quadratic, type QuadraticPoints }
