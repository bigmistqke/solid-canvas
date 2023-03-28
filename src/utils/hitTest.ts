import { InternalContextType } from 'src/context/InternalContext'
import { Shape2DToken } from 'src/parser'
import { CanvasMouseEvent, ResolvedShape2DProps } from 'src/types'
import { isPointInShape2D } from './isPointInShape2D'

export default (
  token: Shape2DToken,
  event: CanvasMouseEvent,
  canvas: InternalContextType | undefined,
  props: ResolvedShape2DProps,
) => {
  if (!canvas) return false

  if (props.pointerEvents === false) return false

  canvas.ctx.save()
  if (origin) {
    canvas.ctx.translate(canvas.origin.x, canvas.origin.y)
  }
  // NOTE:  minimal thickness of 5
  canvas.ctx.lineWidth = props.lineWidth < 20 ? 20 : props.lineWidth
  const hit = isPointInShape2D(event, props, token.path())
  canvas.ctx.restore()

  if (hit) {
    props[event.type]?.(event)
    event.target.push(token)
    if (props.cursor) event.cursor = props.cursor
  }
  return hit
}
