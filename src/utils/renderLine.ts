import { Position } from 'src/types'

const renderLine = (ctx: CanvasRenderingContext2D, start: Position, end: Position) => {
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = 'grey'

  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}
export default renderLine
