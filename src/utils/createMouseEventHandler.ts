import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor } from 'solid-js'
import { InternalContextType } from 'src/context/InternalContext'
import { CanvasToken } from 'src/parser'
import {
  CanvasFlags,
  CanvasMouseEvent,
  CanvasMouseEventTypes,
  Vector,
} from 'src/types'

const createMouseEventHandler = (
  type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp',
  tokens: Accessor<TokenElement<CanvasToken>[]>,
  context: InternalContextType,
  eventListeners: Record<
    CanvasMouseEventTypes,
    ((event: CanvasMouseEvent) => void)[]
  >,
  final: (event: CanvasMouseEvent) => void,
) => {
  let position: Vector
  let delta: Vector
  let event: CanvasMouseEvent
  let lastCursorPosition: Vector

  return (e: MouseEvent) => {
    position = { x: e.clientX, y: e.clientY }
    delta = lastCursorPosition
      ? {
          x: position.x - lastCursorPosition.x,
          y: position.y - lastCursorPosition.y,
        }
      : { x: 0, y: 0 }
    lastCursorPosition = position

    // NOTE:  `event` gets mutated by `token.hitTest`
    event = {
      ctx: context.ctx,
      position,
      delta,
      propagation: true,
      target: [],
      type,
      cursor: 'move',
    }
    if (context.flags.shouldHitTest && context.flags.hasInteractiveTokens) {
      tokens().forEach(({ data }) => {
        if (!event.propagation) return
        if ('hitTest' in data) {
          data.hitTest(event)
        }
      })
    }

    if (event.propagation && final) final(event)

    // setCursorStyle(event.cursor)

    eventListeners[type].forEach(listener => listener(event))

    return event
  }
}

export { createMouseEventHandler }
