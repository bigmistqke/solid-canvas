import { Color, useCanvas, Position } from '../..'
import { createToken } from '@solid-primitives/jsx-parser'
import getColor from '../../utils/getColor'
import { CanvasMouseEvent, parser } from '../../parser'
import { createEffect, createMemo, mergeProps } from 'solid-js'

const Line = createToken(
  parser,
  (props: {
    points: Position[]
    stroke?: Color
    lineWidth?: number
    fill?: Color
    dash?: number[]
    onMouseDown?: (event: CanvasMouseEvent) => void
    onMouseMove?: (event: CanvasMouseEvent) => void
    onMouseUp?: (event: CanvasMouseEvent) => void
  }) => {
    const context = useCanvas()
    const merged = mergeProps(
      {
        stroke: 'black',
        lineWidth: 2,
        fill: 'transparent',
        dash: [],
      },
      props,
    )

    const path = createMemo(() => {
      const result = new Path2D()
      let point = props.points[0]
      result.moveTo(point!.x, point!.y)
      let i = 0
      while ((point = props.points[i])) {
        result.lineTo(point.x, point.y)
        i++
      }
      return result
    })

    const checkInBounds = (event: CanvasMouseEvent) => {
      // TODO: possibile optimization -> transparent stroke/fille === no check
      return (
        event.ctx.isPointInPath(path(), event.position.x, event.position.y) ||
        event.ctx.isPointInStroke(path(), event.position.x, event.position.y)
      )
    }

    return {
      render: ctx => {
        if (!context) return
        if (props.points.length < 2) return
        ctx.setLineDash(merged.dash)
        ctx.strokeStyle = getColor(merged.stroke)
        ctx.fillStyle = getColor(merged.fill)
        ctx.lineWidth = merged.lineWidth
        ctx.fill(path())
        ctx.stroke(path())
        ctx.setLineDash([])
        ctx.moveTo(0, 0)
      },
      mouseDown: event => {
        const inBounds = checkInBounds(event)
        if (inBounds) props.onMouseDown?.(event)
        return inBounds
      },
      mouseMove: event => {
        const inBounds = checkInBounds(event)
        if (inBounds) props.onMouseMove?.(event)
        return inBounds
      },
      mouseUp: event => {
        const inBounds = checkInBounds(event)
        if (inBounds) props.onMouseUp?.(event)
        return inBounds
      },
    }
  },
)
export { Line }
