import {
  CanvasMouseEvent,
  ExtendedColor,
  Object2DProps,
  ResolvedShape2DProps,
} from 'src/types'

const isPointInPath = (
  event: CanvasMouseEvent,
  props: { style: { fill?: ExtendedColor } },
  path: Path2D,
) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  if (!props.style.fill) return false
  return event.ctx.isPointInPath(path, event.position.x, event.position.y)
}
const isPointInStroke = (
  event: CanvasMouseEvent,
  props: { style: { fill?: ExtendedColor } },
  path: Path2D,
) => {
  // TODO:  can not check for props.fill as it would re-mount ColorTokens
  if (!props.style.fill) return false

  // TODO:  we should set the strokeStyle to the path's strokeStyle
  return event.ctx.isPointInStroke(path, event.position.x, event.position.y)
}

export const isPointInShape2D = (
  event: CanvasMouseEvent,
  props: { style: { fill?: ExtendedColor } },
  path: Path2D,
) => {
  const result =
    isPointInPath(event, props, path) ||
    ('stroke' in props ? isPointInStroke(event, props, path) : false)
  return result
}
