import { CanvasMouseEvent } from 'src/types'

const isPointInPath = (event: CanvasMouseEvent, path: Path2D) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  // if (!token.props.fill) return false
  return event.ctx.isPointInPath(path, event.position.x, event.position.y)
}
const isPointInStroke = (event: CanvasMouseEvent, path: Path2D) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  // if (!token.props.stroke) return false
  return event.ctx.isPointInStroke(path, event.position.x, event.position.y)
}

export const isPointInShape = (event: CanvasMouseEvent, path: Path2D) => {
  return isPointInPath(event, path) || isPointInStroke(event, path)
}
