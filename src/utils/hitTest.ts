import { InternalContextType } from 'src/context/InternalContext'
import { Shape2DToken } from 'src/parser'
import { CanvasMouseEvent, ResolvedShape2DProps } from 'src/types'
import { isPointInShape2D } from './isPointInShape2D'

export default (
  token: Shape2DToken,
  event: CanvasMouseEvent,
  internalContext: InternalContextType | undefined,
  props: ResolvedShape2DProps,
) => {
  if (!internalContext) return false

  if (props.pointerEvents === false) return false

  internalContext.ctx.save()

  // NOTE:  minimal thickness of 5
  internalContext.ctx.lineWidth = props.lineWidth < 20 ? 20 : props.lineWidth
  const hit = isPointInShape2D(event, props, token.path())
  internalContext.ctx.restore()

  if (hit) {
    let listeners = props[event.type]
    if (listeners) {
      listeners = Array.isArray(listeners) ? listeners : [listeners]
      listeners.forEach(listener => listener(event))
    }
    event.target.push(token)
    if (props.cursor) event.cursor = props.cursor
  }
  return hit
}
