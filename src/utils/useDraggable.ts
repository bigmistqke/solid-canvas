import { createSignal, createEffect, onCleanup } from 'solid-js'
import { useCanvas } from 'src'
import { CanvasMouseEvent } from 'src/parser'

export default () => {
  const context = useCanvas()

  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 })
  const [selected, setSelected] = createSignal(false)

  createEffect(() => {
    if (!context) return
    if (selected()) {
      const handleMouseMove = (event: CanvasMouseEvent) => {
        setDragPosition(position => ({
          x: position.x + event.delta.x,
          y: position.y + event.delta.y,
        }))
      }
      const handleMouseUp = (event: CanvasMouseEvent) => {
        setSelected(false)
      }
      context.addEventListener('onMouseMove', handleMouseMove)
      context.addEventListener('onMouseUp', handleMouseUp)

      onCleanup(() => {
        context.removeEventListener('onMouseMove', handleMouseMove)
      })
    }
  })

  const dragEventHandler = (event: CanvasMouseEvent) => {
    if (event.target.length === 1 && event.type === 'onMouseDown') {
      setSelected(true)
    }
  }

  return [dragPosition, dragEventHandler] as const
}
