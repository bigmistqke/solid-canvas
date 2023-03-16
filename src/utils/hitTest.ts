import { ShapeProps } from 'src/components/Shape'
import { ShapeToken, CanvasMouseEvent } from 'src/parser'
import { isPointInShape } from './isPointInShape'

export default (
  token: ShapeToken,
  event: CanvasMouseEvent,
  props: ShapeProps,
  dragEventHandler: (event: CanvasMouseEvent) => void,
) => {
  if (props.pointerEvents === false) return false

  const hit = isPointInShape(event, token.path())

  if (hit) {
    props[event.type]?.(event)
    event.target.push(token)
    if (props.draggable) {
      dragEventHandler(event)
    }
  }
  return hit
}
