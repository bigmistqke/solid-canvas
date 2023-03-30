import { CanvasMouseEvent, CanvasMouseEventTypes } from 'src/types'

export { Drag } from './Drag'
export { BezierHandle } from './Handle'

export type ControllerEvents = {
  [K in CanvasMouseEventTypes]: (event: CanvasMouseEvent) => void
} & {
  onFrame: (ctx: CanvasRenderingContext2D) => void
  onHitTest: (event: CanvasMouseEvent) => void
}

export type RegisterControllerEvents = {
  onMouseDown: (callback: (event: CanvasMouseEvent) => void) => void
  onMouseMove: (callback: (event: CanvasMouseEvent) => void) => void
  onMouseUp: (callback: (event: CanvasMouseEvent) => void) => void
  onMouseLeave: (callback: (event: CanvasMouseEvent) => void) => void
  onMouseEnter: (callback: (event: CanvasMouseEvent) => void) => void
  onFrame: (callback: (ctx: CanvasRenderingContext2D) => void) => void
  onHitTest: (callback: (event: CanvasMouseEvent) => void) => void
}
