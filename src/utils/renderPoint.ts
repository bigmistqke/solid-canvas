import { Vector } from 'src/types'

const renderPoint = (ctx: CanvasRenderingContext2D, position: Vector) => {
  ctx.save()
  ctx.beginPath()
  ctx.arc(position.x, position.y, 5, 0, 360)
  ctx.fillStyle = 'black'
  ctx.fill()
  ctx.closePath()
  ctx.restore()
}
export default renderPoint
