import { Color, useCanvas, Position, Dimensions } from '../..'
import { createToken } from '@solid-primitives/jsx-parser'
import getColor from '../../utils/getColor'
import { CanvasMouseEvent, parser } from '../../parser'
import { createEffect, createMemo, mergeProps } from 'solid-js'

const Rectangle = createToken(
  parser,
  (props: {
    position: Position
    dimensions: Dimensions
    stroke?: Color
    fill?: Color
    // rotation?: number
    dash?: number[]
    lineWidth?: number
    onMouseDown?: (event: CanvasMouseEvent) => void
    onMouseMove?: (event: CanvasMouseEvent) => void
    onMouseUp?: (event: CanvasMouseEvent) => void
  }) => {
    const merged = mergeProps(
      {
        position: { x: 0, y: 0 },
        dimensions: { width: 0, height: 0 },
        stroke: 'black',
        rotation: 0,
        fill: 'transparent',
        dash: [],
        lineWidth: 2,
      },
      props,
    )

    const path = createMemo(() => {
      const result = new Path2D()
      result.rect(
        merged.position.x,
        merged.position.y,
        merged.dimensions.width,
        merged.dimensions.height,
      )
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
        // TODO: if fill/stroke is transparent -> don't fill/stroke
        ctx.setLineDash(props.dash ?? [])
        ctx.strokeStyle = getColor(merged.stroke)
        ctx.fillStyle = getColor(merged.fill)
        ctx.lineWidth = merged.lineWidth
        ctx.fill(path())
        ctx.stroke(path())
        ctx.setLineDash([])
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

export { Rectangle }
