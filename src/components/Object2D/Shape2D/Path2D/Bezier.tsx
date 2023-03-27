import { createToken } from '@solid-primitives/jsx-tokenizer'
import {
  createEffect,
  createMemo,
  createSignal,
  mapArray,
  mergeProps,
  onCleanup,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { Portal } from 'solid-js/web'
import { useInternalContext } from 'src/context/InternalContext'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { BezierPoint, Position, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import hitTest from 'src/utils/hitTest'
import invertPosition from 'src/utils/invertPosition'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import useDebugSvg from 'src/utils/useDebugSvg'
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
      points: {
        point: Position
        control: Position
        oppositeControl?: Position
      }[]
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

    const processedPoints = createMemo(
      mapArray(
        () => props.points,
        (value, index) => {
          return {
            ...value,
            get oppositeControl() {
              return index() === 0 || index() === props.points.length - 1
                ? undefined
                : value.oppositeControl
                ? value.oppositeControl
                : getOppositeControl(value.point, value.control)
            },
            get automatic() {
              return index() === 0 || index() === props.points.length - 1
                ? false
                : value.oppositeControl === undefined
            },
          }
        },
      ),
    )

    const handles = useBezierHandles(
      () => processedPoints(),
      () => !!props.editable,
      'cubic',
    )

    const bounds = useBounds(() => {
      return handles
        .points()
        .map(Object.values)
        .flat()
        .filter(v => typeof v === 'object')
    }, matrix)

    // const setDebug = useDebugSvg()

    const path = useTransformedPath(() => {
      const values = handles.points()

      let value = values[0]
      let point = value?.point
      let control = addPositions(point, value?.control)
      let oppositeControl: Position | undefined

      if (!point || !control) return new Path2D()

      let svgString = `M${point.x},${point.y} C${control.x},${control.y} `

      let i = 1

      while ((value = values[i])) {
        point = value.point
        control = addPositions(point, value.control)

        if (!control || !point) {
          console.error('incorrect path', control, point, value)
          return new Path2D()
        }

        oppositeControl = value.automatic
          ? addPositions(point, invertPosition(value?.control))
          : addPositions(point, value.oppositeControl)

        svgString += `${control.x},${control.y} ${point.x},${point.y} `
        if (oppositeControl && i !== values.length - 1)
          svgString += `${oppositeControl.x},${oppositeControl.y} `

        i++
      }

      // setDebug(svgString)

      const path2D = new Path2D(svgString)
      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const debug = (ctx: CanvasRenderingContext2D) => {
      if (!canvas) return
      renderPath(ctx, defaultBoundsProps, bounds().path, canvas?.origin)
      handles.render(ctx)
      canvas.ctx.restore()
    }

    let token: Shape2DToken
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
        token = this
        handles.hitTest(event)
        return hitTest(token, event, canvas?.ctx, merged, canvas?.origin)
      },
    }
  },
)

const GroupedBezier = withGroup(Bezier)

export { GroupedBezier as Bezier }
