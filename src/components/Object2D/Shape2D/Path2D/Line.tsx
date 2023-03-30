import { createToken } from '@solid-primitives/jsx-tokenizer'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createLinearHandles } from 'src/utils/createHandles'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { mergeShape2DProps } from 'src/utils/resolveShape2DProps'
import { createControlledProps } from 'src/utils/createControlledProps'
/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Line = createToken(
  parser,
  (
    props: Shape2DProps & {
      points: Position[]
      close?: boolean
    },
  ) => {
    const controlled = createControlledProps(
      mergeShape2DProps(props, {
        close: false,
      }),
    )
    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)

    const matrix = createMatrix(controlled.props)
    const bounds = createBounds(() => props.points, matrix)

    const handles = createLinearHandles(
      () => props.points,
      () => props.editable,
    )

    const path = createTransformedPath(() => {
      // calculate path
      const path2D = new Path2D()
      let point = props.points[0]
      let offset = handles.offsets()[0]
      path2D.moveTo(point!.x + (offset?.x ?? 0), point!.y + (offset?.y ?? 0))
      let i = 0
      while ((point = props.points[i])) {
        offset = handles.offsets()[i]
        path2D.lineTo(point.x + (offset?.x ?? 0), point.y + (offset?.y ?? 0))
        i++
      }
      if (controlled.props.close) path2D.closePath()

      return path2D
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Line',
      render: ctx => {
        renderPath(
          ctx,
          controlled.props,
          path(),
          context.origin,
          context.isSelected(token) || context.isHovered(token),
        )
        handles?.render(ctx)
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
      path,
      hitTest: event => {
        const hit = hitTest(token, event, context, controlled.props)
        if (hit) {
          controlled.events[event.type].forEach(callback => callback(event))
        }
        return hit
      },
    }

    return token
  },
)

export { Line }
