import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import {
  CanvasMouseEvent,
  CanvasMouseEventTypes,
  Position,
  Shape2DProps,
} from 'src/types'

type DragOptions = {
  active?: boolean
  onDragMove?: (position: Position, event: CanvasMouseEvent) => void
}

export type ControllerEvents = Record<
  CanvasMouseEventTypes,
  (callback: (event: CanvasMouseEvent) => void) => void
>

function Drag(options: DragOptions): any
function Drag(
  props: Shape2DProps,
  events: ControllerEvents,
  options: DragOptions,
): any
function Drag(
  propsOrOptions: Shape2DProps | DragOptions,
  events?: ControllerEvents,
  options?: DragOptions,
) {
  if (!events || !options) {
    return (props: Shape2DProps, events: ControllerEvents) =>
      Drag(props, events, propsOrOptions as DragOptions)
  }
  const canvas = useInternalContext()
  const props = propsOrOptions as Shape2DProps

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
        options.onDragMove?.(dragPosition(), event)
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
      options.active === undefined
        ? true
        : options.active
    ) {
      setSelected(true)
      event.propagation = false
    }
  }

  events.onMouseDown(dragEventHandler)

  return {
    ...props,
    get position() {
      return {
        x: (props.position ? props.position.x : 0) + dragPosition().x,
        y: (props.position ? props.position.y : 0) + dragPosition().y,
      }
    },
  }
}

export { Drag }
