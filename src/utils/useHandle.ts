import { Accessor } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { Position } from 'src/types'
import transformPoint from 'src/utils/transformPoint'

const useHandle = (
  points: Accessor<{ point: Position; control: Position }[]>,
  matrix: Accessor<DOMMatrix>,
) => {
  const canvas = useInternalContext()

  const renderPoint = (position: Position) => {
    if (!canvas) return
    canvas.ctx.beginPath()
    canvas.ctx.arc(position.x, position.y, 5, 0, 360)
    canvas.ctx.fillStyle = 'black'
    canvas.ctx.fill()
    canvas.ctx.closePath()
  }

  const renderLine = (start: Position, end: Position) => {
    if (!canvas) return
    canvas.ctx.beginPath()
    canvas.ctx.moveTo(start.x, start.y)
    canvas.ctx.lineTo(end.x, end.y)
    canvas.ctx.stroke()
    canvas.ctx.closePath()
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
    if (!canvas) return
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
