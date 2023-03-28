import { createContext, Setter, useContext } from 'solid-js'
import { CanvasToken } from 'src/parser'
import { Position, CanvasMouseEvent, CursorStyle } from '../types'

export type InternalContextType = {
  ctx: CanvasRenderingContext2D
  origin: Position
  debug: boolean
  selected: CanvasToken | undefined
  hovered: CanvasToken | undefined
  addEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
  removeEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
}
export const InternalContext = createContext<InternalContextType>()

export const useInternalContext = () => useContext(InternalContext)
