import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { createBounds } from 'src/utils/createBounds'
import { createLinearHandles } from 'src/utils/createHandles'
import { createMatrix } from 'src/utils/createMatrix'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import withGroup from 'src/utils/withGroup'

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
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShape2DProps, close: false }, props)

    const matrix = createMatrix(merged)
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
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Line',
      render: ctx => {
        renderPath(
          ctx,
          merged,
          path(),
          canvas?.origin,
          canvas?.isSelected(token) || canvas?.isHovered(token),
        )
        handles?.render(ctx)
      },
      debug: ctx =>
        renderPath(
          ctx,
          defaultBoundsProps,
          bounds().path,
          canvas?.origin,
          false,
        ),
      path,
      hitTest: event => {
        handles?.hitTest(event)
        return hitTest(token, event, canvas, merged)
      },
    }
    return token
  },
)

const GroupedLine = withGroup(Line)

export { GroupedLine as Line }
