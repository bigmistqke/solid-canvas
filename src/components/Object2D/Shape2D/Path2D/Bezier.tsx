import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createMemo, mergeProps } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import { useBezierHandles } from 'src/utils/useHandles'
import useMatrix from 'src/utils/useMatrix'
import useTransformedPath from 'src/utils/useTransformedPath'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a cubic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */
const Bezier = createToken(
  parser,
  (
    props: Shape2DProps & {
      points: { point: Position; control: Position }[]
      close?: boolean
    },
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShape2DProps, close: false }, props)

    const matrix = useMatrix(merged)

    const getOppositeControl = (point: Position, control: Position) => {
      return {
        x: control.x * -1,
        y: control.y * -1,
      }
    }

    const getAllPoints = createMemo(() =>
      props.points.map(({ point, control }, i) =>
        i === 0 || i === props.points.length - 1
          ? { control, point }
          : {
              control,
              point,
              oppositeControl: getOppositeControl(point, control),
            },
      ),
    )

    const handles = useBezierHandles(
      () => getAllPoints(),
      () => !!props.editable,
      'cubic',
    )

    const bounds = useBounds(() => {
      return getAllPoints().map(Object.values).flat()
    }, matrix)

    const path = useTransformedPath(() => {
      const values = getAllPoints()
      const offsets = handles.offsets()

      let value = values[0]
      let offset = offsets[0]
      let point = addPositions(value?.point, offset?.point)
      let control = addPositions(offset?.point, offset?.control, value?.control)

      if (!point || !offset || !control) return new Path2D()

      let svgString = `M${point.x},${point.y} C${control.x},${control.y} `

      let i = 1
      while ((value = getAllPoints()[i])) {
        offset = offsets[i]
        point = addPositions(offset?.point, value.point)
        control = addPositions(
          value.point,
          offset?.point,
          offset?.control,
          value.control,
        )

        if (!offset || !control || !point) {
          console.error('incorrect path')
          return new Path2D()
        }

        // TODO:  implement manual control-points
        if (i === 2) svgString += 'S'
        svgString += `${control.x},${control.y} ${point.x},${point.y} `
        i++
      }
      const path2D = new Path2D(svgString)
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!canvas) return
      canvas.ctx.save()
      renderPath(ctx, defaultBoundsProps, bounds().path)
      handles.render(ctx)
      canvas.ctx.restore()
    }

    let token: Shape2DToken
    return {
      type: 'Shape2D',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => {
        handles.render(ctx)
        renderPath(ctx, merged, path())
      },
      debug,
      path,
      hitTest: function (event) {
        token = this
        handles.hitTest(event)
        return hitTest(token, event, canvas?.ctx, merged)
      },
    }
  },
)

const GroupedBezier = withGroup(Bezier)

export { GroupedBezier as Bezier }
