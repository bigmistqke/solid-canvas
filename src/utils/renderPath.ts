import { InternalContextType } from 'src/context/InternalContext'
import { ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

let style
export default (
  context: InternalContextType,
  props: ResolvedShape2DProps<any>,
  path: Path2D,
) => {
  style = props.style
  context.ctx.save()

  // NOTE:  it would be more performant if we would compose commands from the styles with mapArray
  //        and forEach execute them, instead of doing checks on each renderPath.

  if (style.shadow) {
    context.ctx.shadowBlur = style.shadow.blur ?? 0
    context.ctx.shadowOffsetX = style.shadow.offset?.x ?? 0
    context.ctx.shadowOffsetY = style.shadow.offset?.y ?? 0
    context.ctx.shadowColor =
      resolveColor(style.shadow.color ?? 'black') ?? 'black'
  }
  if (style.composite) context.ctx.globalCompositeOperation = style.composite
  if (style.opacity) context.ctx.globalAlpha = style.opacity

  if (style.fill) {
    context.ctx.fillStyle = resolveExtendedColor(style.fill) ?? 'transparent'
    context.ctx.fill(path)
  }
  if (style.stroke && style.stroke !== 'transparent') {
    if (style.lineWidth) context.ctx.lineWidth = style.lineWidth
    if (style.miterLimit) context.ctx.miterLimit = style.miterLimit
    if (style.lineJoin) context.ctx.lineJoin = style.lineJoin ?? 'bevel'
    if (context.ctx.lineCap) context.ctx.lineCap = style.lineCap ?? 'round'
    if (style.lineDash) context.ctx.setLineDash(style.lineDash)

    context.ctx.strokeStyle = resolveExtendedColor(style.stroke) ?? 'black'
    context.ctx.stroke(path)
  }

  context.ctx.restore()
}
