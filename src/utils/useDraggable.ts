import { createSignal, createEffect, onCleanup } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { CanvasMouseEvent, Shape2DProps } from 'src/types'

export default (props: Shape2DProps) => {
  const canvas = useInternalContext()

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
        props.onDragMove?.(dragPosition(), event)
        event.propagation = false
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
      event.propagation = false
    }
  }

  return [dragPosition, dragEventHandler] as const
}
