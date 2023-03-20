import { Accessor } from 'solid-js'
import { useCanvas } from 'src/context'
import { Position } from 'src/types'
import transformPoint from 'src/utils/transformPoint'

const useHandle = (
  points: Accessor<{ point: Position; control: Position }[]>,
  matrix: Accessor<DOMMatrix>,
) => {
  const context = useCanvas()

  const renderPoint = (position: Position) => {
    if (!context) return
    context.ctx.beginPath()
    context.ctx.arc(position.x, position.y, 5, 0, 360)
    context.ctx.fillStyle = 'black'
    context.ctx.fill()
    context.ctx.closePath()
  }

  const renderLine = (start: Position, end: Position) => {
    if (!context) return
    context.ctx.beginPath()
    context.ctx.moveTo(start.x, start.y)
    context.ctx.lineTo(end.x, end.y)
    context.ctx.stroke()
    context.ctx.closePath()
  }

  const getOppositeControl = (point: Position, control: Position) => {
    const delta = {
      x: control.x - point.x,
      y: control.y - point.y,
    }
    return {
      x: point.x + delta.x * -1,
      y: point.y + delta.y * -1,
    }
  }

  const renderHandles = () => {
    if (!context) return
    points().forEach(({ control, point }, i) => {
      let oppositeControl
      if (i !== 0 && i !== points.length - 1) {
        oppositeControl = transformPoint(getOppositeControl(point, control), matrix())
        renderPoint(oppositeControl)
      }

      point = transformPoint(point, matrix())
      control = transformPoint(control, matrix())
      if (oppositeControl) renderLine(point, oppositeControl)

      renderLine(point, control)
      renderPoint(point)
      renderPoint(control)
    })
  }

  return {
    render: renderHandles,
    hitTest: () => {},
  }
}

export default useHandle
