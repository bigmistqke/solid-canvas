import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { Object2DProps } from 'src/components/Object2D/createObject2D'
import { useInternalContext } from 'src/context/InternalContext'
import { CanvasMouseEvent, CanvasMouseEventTypes, Position } from 'src/types'

type DragOptions = {
  active?: boolean
  controlled?: boolean
  onDragMove?: (position: Position, event: CanvasMouseEvent) => void
}

export type ControllerEvents = Record<
  CanvasMouseEventTypes,
  (callback: (event: CanvasMouseEvent) => void) => void
>

function Drag(options: DragOptions): any
function Drag(
  props: Object2DProps,
  events: ControllerEvents,
  options: DragOptions,
): any
function Drag(
  propsOrOptions: Object2DProps | DragOptions,
  events?: ControllerEvents,
  options?: DragOptions,
) {
  if (!events || !options) {
    return (props: Object2DProps, events: ControllerEvents) =>
      Drag(props, events, propsOrOptions as DragOptions)
  }
  const canvas = useInternalContext()
  const props = propsOrOptions as Object2DProps

  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 })
  const [selected, setSelected] = createSignal(false)

  createEffect(() => {
    if (!canvas) return
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

      canvas.addEventListener('onMouseMove', handleMouseMove)
      canvas.addEventListener('onMouseUp', handleMouseUp)

      onCleanup(() => {
        canvas.removeEventListener('onMouseMove', handleMouseMove)
        canvas.removeEventListener('onMouseUp', handleMouseUp)
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

  return () => ({
    ...props,
    get position() {
      return options.controlled
        ? props.position
        : {
            x: (props.position ? props.position.x : 0) + dragPosition().x,
            y: (props.position ? props.position.y : 0) + dragPosition().y,
          }
    },
  })
}

export { Drag }
