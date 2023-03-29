import { createEffect, createSignal, onCleanup } from 'solid-js'
import { Object2DProps } from 'src/components/Object2D/createObject2D'
import { useInternalContext } from 'src/context/InternalContext'
import { CanvasMouseEvent } from 'src/types'

const createDraggable = (props: Object2DProps) => {
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
    if (
      event.target.length === 1 &&
      event.type === 'onMouseDown' &&
      props.draggable
    ) {
      setSelected(true)
      event.propagation = false
    }
  }

  return [dragPosition, dragEventHandler] as const
}

export { createDraggable }
