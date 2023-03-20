import { createSignal, createEffect, onCleanup } from 'solid-js'
import { useCanvas } from 'src'
import { CanvasMouseEvent } from 'src/types'

export default () => {
  const canvas = useCanvas()

  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 })
  const [selected, setSelected] = createSignal(false)

  createEffect(() => {
    if (!canvas) return
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
      canvas.addEventListener('onMouseMove', handleMouseMove)
      canvas.addEventListener('onMouseUp', handleMouseUp)

      onCleanup(() => {
        canvas.removeEventListener('onMouseMove', handleMouseMove)
      })
    }
  })

  const dragEventHandler = (event: CanvasMouseEvent) => {
    if (event.target.length === 1 && event.type === 'onMouseDown') {
      setSelected(true)
      event.stopPropagation()
    }
  }

  return [dragPosition, dragEventHandler] as const
}
