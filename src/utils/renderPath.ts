import { InternalContextType } from 'src/context/InternalContext'
import { ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

export default (
  context: InternalContextType,
  props: ResolvedShape2DProps<any>,
  path: Path2D,
) => {
  context.ctx.save()

  // NOTE:  it would be more performant if we would compose commands from the styles with mapArray
  //        and forEach execute them, instead of doing checks on each renderPath.

  if (props.style.shadow) {
    context.ctx.shadowBlur = props.style.shadow.blur ?? 0
    context.ctx.shadowOffsetX = props.style.shadow.offset?.x ?? 0
    context.ctx.shadowOffsetY = props.style.shadow.offset?.y ?? 0
    context.ctx.shadowColor =
      resolveColor(props.style.shadow.color ?? 'black') ?? 'black'
  }
  if (props.style.composite)
    context.ctx.globalCompositeOperation = props.style.composite
  if (props.style.opacity) context.ctx.globalAlpha = props.style.opacity

  if (props.style.fill) {
    context.ctx.fillStyle =
      resolveExtendedColor(props.style.fill) ?? 'transparent'
    context.ctx.fill(path)
  }
  if (props.style.stroke && props.style.stroke !== 'transparent') {
    if (props.style.lineWidth) context.ctx.lineWidth = props.style.lineWidth
    if (props.style.miterLimit) context.ctx.miterLimit = props.style.miterLimit
    if (props.style.lineJoin)
      context.ctx.lineJoin = props.style.lineJoin ?? 'bevel'
    if (context.ctx.lineCap)
      context.ctx.lineCap = props.style.lineCap ?? 'round'
    if (props.style.lineDash) context.ctx.setLineDash(props.style.lineDash)

    context.ctx.strokeStyle =
      resolveExtendedColor(props.style.stroke) ?? 'black'
    context.ctx.stroke(path)
  }

  context.ctx.restore()
}
