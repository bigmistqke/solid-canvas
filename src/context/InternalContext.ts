import { createContext, Setter, useContext } from 'solid-js'
import { Position, CanvasMouseEvent, CursorStyle } from '../types'

export type InternalContext = {
  ctx: CanvasRenderingContext2D
  origin: Position
  debug: boolean
  setCursorStyle: Setter<CursorStyle>
  addEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
  removeEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
}
export const InternalContext = createContext<InternalContext>()

export const useInternalContext = () => useContext(InternalContext)
