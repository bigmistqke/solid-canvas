import { ShapeToken } from 'src/parser'
import { CanvasMouseEvent, ResolvedShapeProps } from 'src/types'
import { isPointInShape } from './isPointInShape'

export default (
  token: ShapeToken,
  event: CanvasMouseEvent,
  ctx: CanvasRenderingContext2D | undefined,
  props: ResolvedShapeProps,
  dragEventHandler: (event: CanvasMouseEvent) => void,
) => {
  if (!ctx) return false
  if (props.pointerEvents === false) return false

  ctx.save()
  // NOTE:  minimal thickness of 5
  ctx.lineWidth = props.lineWidth < 20 ? 20 : props.lineWidth
  const hit = isPointInShape(event, props, token.path())
  ctx.restore()

  if (hit) {
    props[event.type]?.(event)
    event.target.push(token)
    if (props.draggable) {
      dragEventHandler(event)
    }
  }
  return hit
}
