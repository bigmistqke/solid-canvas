import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createMemo, mergeProps } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import addVectors from 'src/utils/addVectors'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import useControls from 'src/utils/useControls'
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

    const controls = useControls(props)

    const getOppositeControl = (point: Position, control: Position) => {
      return {
        x: point.x + control.x * -1,
        y: point.y + control.y * -1,
      }
    }

    const getAllPoints = createMemo(() =>
      props.points.map(({ point, control }, i) =>
        i === 0 || i === props.points.length - 1
          ? { control: addVectors(control, point), point }
          : {
              control: addVectors(control, point),
              point,
              oppositeControl: getOppositeControl(point, control),
            },
      ),
    )

    const bounds = useBounds(() => {
      return getAllPoints().map(Object.values).flat()
    }, matrix)

    const path = useTransformedPath(() => {
      let point = getAllPoints()[0]
      let offset = controls.offsets()[0]

      if (!point || !offset) return new Path2D()

      point = {
        control: addVectors(offset.control, offset.point, point.control),
        point: addVectors(offset.point, point.point),
      }

      let svgString = `M${point.point.x},${point.point.y} C${point.control.x},${point.control.y} `

      let i = 1
      while ((point = getAllPoints()[i])) {
        offset = controls.offsets()[i]
        if (!offset) return new Path2D()
        point = {
          control: addVectors(offset.control, offset.point, point.control),
          point: addVectors(offset.point, point.point),
        }

        if (i === 2) svgString += 'S'
        svgString += `${point.control.x},${point.control.y} ${point.point.x},${point.point.y} `
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
      controls.render(ctx)
      canvas.ctx.restore()
    }

    let token: Shape2DToken
    return {
      type: 'Shape2D',
      id: 'Bezier',
      render: (ctx: CanvasRenderingContext2D) => {
        controls.render(ctx)
        renderPath(ctx, merged, path())
      },
      debug,
      path,
      hitTest: function (event) {
        token = this
        controls.hitTest(event)
        return hitTest(token, event, canvas?.ctx, merged)
      },
    }
  },
)

const GroupedBezier = withGroup(Bezier)

export { GroupedBezier as Bezier }
