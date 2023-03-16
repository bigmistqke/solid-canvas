import { Path2DPropsWithoutEvents } from 'src/components/Path2D'
import { getExtendedColor } from './getColor'

export default (
  ctx: CanvasRenderingContext2D,
  props: Required<Path2DPropsWithoutEvents>,
  path: Path2D,
) => {
  ctx.setLineDash(props.dash)
  ctx.strokeStyle = getExtendedColor(props.stroke) ?? 'black'
  ctx.fillStyle = getExtendedColor(props.fill) ?? 'transparent'
  ctx.lineWidth = props.lineWidth
  ctx.fill(path)
  ctx.stroke(path)
  ctx.setLineDash([])
}
