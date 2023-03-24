import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import useControls from 'src/utils/useControls'
import useMatrix from 'src/utils/useMatrix'
import useTransformedPath from 'src/utils/useTransformedPath'
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

    const matrix = useMatrix(merged)
    const bounds = useBounds(() => props.points, matrix)
    const controls = useControls(props)

    const path = useTransformedPath(() => {
      // calculate path
      const path2D = new Path2D()
      let point = props.points[0]
      let offset = controls.offsets()[0]
      path2D.moveTo(point!.x + (offset?.x ?? 0), point!.y + (offset?.y ?? 0))
      let i = 0
      while ((point = props.points[i])) {
        offset = controls.offsets()[i]
        path2D.lineTo(point.x + (offset?.x ?? 0), point.y + (offset?.y ?? 0))
        i++
      }
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    return {
      type: 'Shape2D',
      id: 'Line',
      render: (ctx: CanvasRenderingContext2D) => {
        renderPath(ctx, merged, path())
        controls?.render(ctx)
      },
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      path,
      hitTest: function (event) {
        const token: Shape2DToken = this
        controls?.hitTest(event)
        return hitTest(token, event, canvas?.ctx, merged)
      },
    }
  },
)

const GroupedLine = withGroup(Line)

export { GroupedLine as Line }
