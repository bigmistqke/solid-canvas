import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { CanvasMouseEvent, Position } from 'src/types'
import { mergeGetters } from 'src/utils/mergeGetters'
import { createController } from './createController'

type DragOptions = {
  active?: boolean
  controlled?: boolean
  onDragMove?: (position: Position, event: CanvasMouseEvent) => void
}
const Drag = createController<DragOptions>((props, events, options) => {
  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 })
  const [selected, setSelected] = createSignal(false)
  const internalContext = useInternalContext()

  options = {
    active: true,
    controlled: false,
    ...options,
  }

  createEffect(() => {
    if (!internalContext) return
    if (selected()) {
      const handleMouseMove = (event: CanvasMouseEvent) => {
        event.propagation = false
        setDragPosition(position => ({
          x: position.x + event.delta.x,
          y: position.y + event.delta.y,
        }))

        options.onDragMove?.(dragPosition(), event)
      }
      const handleMouseUp = (event: CanvasMouseEvent) => {
        setSelected(false)
      }

      internalContext.addEventListener('onMouseMove', handleMouseMove)
      internalContext.addEventListener('onMouseUp', handleMouseUp)

      onCleanup(() => {
        internalContext.removeEventListener('onMouseMove', handleMouseMove)
        internalContext.removeEventListener('onMouseUp', handleMouseUp)
      })
    }
  })

  const dragEventHandler = (event: CanvasMouseEvent) => {
    if (
      event.target.length === 1 &&
      event.type === 'onMouseDown' &&
      options.active === undefined
        ? true
        : options.active
    ) {
      setSelected(true)
      event.propagation = false
    }
  }

  events.onMouseDown(dragEventHandler)

  return () =>
    mergeGetters(props(), {
      position: {
        x: options.controlled
          ? props().position?.x
          : (props().position?.x || 0) + dragPosition().x,
        y: options.controlled
          ? props().position?.y
          : (props().position?.y || 0) + dragPosition().y,
      },
    })
})

export { Drag }
