import { GroupProps } from 'src/components/Object2D/Group'
import { CanvasMouseEvent, ResolvedShape2DProps } from 'src/types'

const isPointInPath = (
  event: CanvasMouseEvent,
  props: ResolvedShape2DProps | GroupProps,
  path: Path2D,
) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  if (!props.fill || props.fill === 'transparent') return false
  return event.ctx.isPointInPath(path, event.position.x, event.position.y)
}
const isPointInStroke = (
  event: CanvasMouseEvent,
  props: ResolvedShape2DProps,
  path: Path2D,
) => {
  // TODO:  can not check for props.fill as it would re-mount ColorTokens
  if (!props.stroke || props.stroke === 'transparent') return false

  // TODO:  we should set the strokeStyle to the path's strokeStyle
  return event.ctx.isPointInStroke(path, event.position.x, event.position.y)
}

export const isPointInShape2D = (
  event: CanvasMouseEvent,
  props: ResolvedShape2DProps | GroupProps,
  path: Path2D,
) => {
  const result =
    isPointInPath(event, props, path) ||
    ('stroke' in props ? isPointInStroke(event, props, path) : false)
  return result
}
