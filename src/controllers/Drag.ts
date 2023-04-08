import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { CanvasMouseEvent, Vector, Shape2DProps } from 'src/types'
import { createController } from './createController'

type DragOptions = {
  active?: boolean
  controlled?: boolean
  onDragMove?: (position: Vector, event: CanvasMouseEvent) => void
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

  createEffect(() => {
    if (!internalContext) return
    if (selected()) {
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
  let position = { x: 0, y: 0 }

  createEffect(() => {})

  return {
    transform: {
      get position() {
        if (options.controlled) return props().transform.position
        else {
          position.x = (props().transform.position?.x || 0) + dragPosition().x
          position.y = (props().transform.position?.y || 0) + dragPosition().y
          return position
        }
      },
    },
    style: {
      pointerEvents: true,
    },
  }
})

export { Drag }
