import { InternalContextType } from 'src/context/InternalContext'
import { Vector, ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

export default (
  context: InternalContextType,
  props: ResolvedShape2DProps,
  path: Path2D,
  hover: boolean | undefined,
) => {
  context.ctx.save()
  if (props.shadow) {
    context.ctx.shadowBlur = props.shadow.blur ?? 0
    context.ctx.shadowOffsetX = props.shadow.offset?.x ?? 0
    context.ctx.shadowOffsetY = props.shadow.offset?.y ?? 0
    context.ctx.shadowColor =
      resolveColor(props.shadow.color ?? 'black') ?? 'black'
  }

  if (props.composite) context.ctx.globalCompositeOperation = props.composite
  if (props.opacity) context.ctx.globalAlpha = props.opacity

  context.ctx.strokeStyle = resolveExtendedColor(props.stroke) ?? 'black'
  context.ctx.fillStyle = resolveExtendedColor(props.fill) ?? 'transparent'
  context.ctx.lineWidth = props.lineWidth
  context.ctx.miterLimit = props.miterLimit
  context.ctx.lineJoin = props.lineJoin
  context.ctx.lineCap = props.lineCap
  context.ctx.setLineDash(props.lineDash)

  context.ctx.setTransform(context.matrix)

  if (hover && props.hoverStyle) {
    if (props.hoverStyle.stroke) {
      context.ctx.strokeStyle =
        resolveExtendedColor(props.hoverStyle.stroke) ?? context.ctx.strokeStyle
    }
    if (props.hoverStyle.fill) {
      context.ctx.fillStyle =
        resolveExtendedColor(props.hoverStyle.fill) ?? context.ctx.fillStyle
    }
    if (props.hoverStyle.lineWidth)
      context.ctx.lineWidth = props.hoverStyle.lineWidth
    if (props.hoverStyle.miterLimit)
      context.ctx.miterLimit = props.hoverStyle.miterLimit
    if (props.hoverStyle.lineJoin)
      context.ctx.lineJoin = props.hoverStyle.lineJoin
    if (props.hoverStyle.lineCap) context.ctx.lineCap = props.hoverStyle.lineCap
    if (props.hoverStyle.lineDash)
      context.ctx.setLineDash(props.hoverStyle.lineDash)
  }

  context.ctx.fill(path)
  context.ctx.stroke(path)

  context.ctx.setLineDash([])
  context.ctx.restore()
}
