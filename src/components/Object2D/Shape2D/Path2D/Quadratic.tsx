import { createToken } from '@solid-primitives/jsx-tokenizer'
import {
  createEffect,
  createMemo,
  createSignal,
  mapArray,
  mergeProps,
  onCleanup,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { BezierPoint, Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import useDebugSvg from 'src/utils/useDebugSvg'
import hitTest from 'src/utils/hitTest'
import invertPosition from 'src/utils/invertPosition'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import { useBezierHandles } from 'src/utils/useHandles'
import useMatrix from 'src/utils/useMatrix'
import useTransformedPath from 'src/utils/useTransformedPath'
import withGroup from 'src/utils/withGroup'
import { createStore, produce } from 'solid-js/store'

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

    const [processedPoints, setProcessedPoints] = createStore<BezierPoint[]>([])

    const setDebug = useDebugSvg()

    const processPoints = createMemo(
      mapArray(
        () => props.points,
        (value, index) => {
          const automatic = !('control' in value)
          const previousControl = addPositions(
            props.points[index() - 1]?.control,
            props.points[index() - 1]?.point,
          )
          const control =
            value.control ??
            invertPosition(
              addPositions(previousControl, invertPosition(value.point)),
            )

          const oppositeControl = previousControl
            ? {
                x: previousControl.x - value.point.x,
                y: previousControl.y - value.point.y,
              }
            : undefined

          return index() === props.points.length - 1
            ? {
                point: value.point,
                oppositeControl,
                automatic,
              }
            : index() === 0
            ? {
                point: value.point,
                control,
                automatic,
              }
            : {
                point: value.point,
                control,
                oppositeControl,
                automatic,
              }
        },
      ),
    )

    const matrix = useMatrix(merged)
    const handles = useBezierHandles(
      processPoints,
      () => props.editable,
      'quadratic',
    )

    const bounds = useBounds(() => {
      const points = handles.points()
      return points
        .map((point, i) => {
          let result: Position[] = [point.point]
          if (point.control) {
            const control = addPositions(point.point, point.control)
            const nextPoint = points[i + 1]?.point
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
      const values = handles.points()

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

        console.log(values.length - 1, i)

        if (i !== values.length - 1 && control) {
          svg += `${point.x},${point.y} ${control.x},${control.y} `
        } else {
          console.log('this')
          svg += `${point.x},${point.y} `
        }

        i++
      }

      setDebug(svg)
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
        return hitTest(token, event, canvas?.ctx, merged, canvas?.origin)
      },
    }
  },
)

const GroupedQuadratic = withGroup(Quadratic)

export { GroupedQuadratic as Quadratic, type QuadraticPoints }
