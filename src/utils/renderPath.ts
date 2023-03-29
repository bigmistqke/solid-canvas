import { Position, ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

export default (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  props: ResolvedShape2DProps,
  path: Path2D,
  origin: Position | undefined,
  hover: boolean | undefined,
) => {
  ctx.save()
  if (props.shadow) {
    ctx.shadowBlur = props.shadow.blur ?? 0
    ctx.shadowOffsetX = props.shadow.offset?.x ?? 0
    ctx.shadowOffsetY = props.shadow.offset?.y ?? 0
    ctx.shadowColor = resolveColor(props.shadow.color ?? 'black') ?? 'black'
  }

  if (props.composite) ctx.globalCompositeOperation = props.composite
  if (props.opacity) ctx.globalAlpha = props.opacity

  if (origin) {
    // ctx.moveTo(origin.x, origin.y)
    ctx.translate(origin.x, origin.y)
  }

  ctx.strokeStyle = resolveExtendedColor(props.stroke) ?? 'black'
  ctx.fillStyle = resolveExtendedColor(props.fill) ?? 'transparent'
  ctx.lineWidth = props.lineWidth
  ctx.miterLimit = props.miterLimit
  ctx.lineJoin = props.lineJoin
  ctx.lineCap = props.lineCap
  ctx.setLineDash(props.lineDash)

  if (hover && props.hoverStyle) {
    if (props.hoverStyle.stroke) {
      ctx.strokeStyle =
        resolveExtendedColor(props.hoverStyle.stroke) ?? ctx.strokeStyle
    }
    if (props.hoverStyle.fill) {
      ctx.fillStyle =
        resolveExtendedColor(props.hoverStyle.fill) ?? ctx.fillStyle
    }
    if (props.hoverStyle.lineWidth) ctx.lineWidth = props.hoverStyle.lineWidth
    if (props.hoverStyle.miterLimit)
      ctx.miterLimit = props.hoverStyle.miterLimit
    if (props.hoverStyle.lineJoin) ctx.lineJoin = props.hoverStyle.lineJoin
    if (props.hoverStyle.lineCap) ctx.lineCap = props.hoverStyle.lineCap
    if (props.hoverStyle.lineDash) ctx.setLineDash(props.hoverStyle.lineDash)
  }

  ctx.fill(path)
  ctx.stroke(path)

  ctx.setLineDash([])
  ctx.restore()
}
