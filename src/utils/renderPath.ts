import { InternalContextType } from 'src/context/InternalContext'
import { ResolvedShape2DProps } from 'src/types'
import { resolveColor, resolveExtendedColor } from './resolveColor'

export default (
  context: InternalContextType,
  props: ResolvedShape2DProps,
  path: Path2D,
) => {
  props.style.lineWidth
  context.ctx.save()
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

  context.ctx.strokeStyle = resolveExtendedColor(props.style.stroke) ?? 'black'
  context.ctx.fillStyle =
    resolveExtendedColor(props.style.fill) ?? 'transparent'
  context.ctx.lineWidth = props.style.lineWidth ?? 1
  context.ctx.miterLimit = props.style.miterLimit ?? 1
  context.ctx.lineJoin = props.style.lineJoin ?? 'bevel'
  context.ctx.lineCap = props.style.lineCap ?? 'round'
  context.ctx.setLineDash(props.style.lineDash ?? [])

  context.ctx.setTransform(context.matrix)

  context.ctx.fill(path)
  context.ctx.stroke(path)

  context.ctx.setLineDash([])
  context.ctx.restore()
}
