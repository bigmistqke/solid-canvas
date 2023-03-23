import { ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

export default (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  props: ResolvedShape2DProps,
  path: Path2D,
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

  ctx.strokeStyle = resolveExtendedColor(props.stroke) ?? 'black'
  ctx.fillStyle = resolveExtendedColor(props.fill) ?? 'transparent'
  ctx.lineWidth = props.lineWidth
  ctx.miterLimit = props.miterLimit
  ctx.lineJoin = props.lineJoin
  ctx.lineCap = props.lineCap
  ctx.setLineDash(props.lineDash)

  ctx.fill(path)
  ctx.stroke(path)

  ctx.setLineDash([])
  ctx.restore()
}
