import { Path2DProps } from 'src/components/Path2D'
import { Path2DToken, CanvasMouseEvent } from 'src/parser'
import { isPointInShape } from './isPointInShape'

export default (
  token: Path2DToken,
  event: CanvasMouseEvent,
  props: Path2DProps,
  dragEventHandler: (event: CanvasMouseEvent) => void,
) => {
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
