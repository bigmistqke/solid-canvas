import { Shape2DToken } from 'src/parser'
import { CanvasMouseEvent, ResolvedShape2DProps } from 'src/types'
import { isPointInShape2D } from './isPointInShape2D'

export default (
  token: Shape2DToken,
  event: CanvasMouseEvent,
  ctx: CanvasRenderingContext2D | undefined,
  props: ResolvedShape2DProps,
) => {
  if (!ctx) return false
  if (props.pointerEvents === false) return false

  ctx.save()
  // NOTE:  minimal thickness of 5
  ctx.lineWidth = props.lineWidth < 20 ? 20 : props.lineWidth
  const hit = isPointInShape2D(event, props, token.path())
  ctx.restore()

  if (hit) {
    props[event.type]?.(event)
    event.target.push(token)
  }
  return hit
}
