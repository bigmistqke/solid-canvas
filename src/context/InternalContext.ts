import { Accessor, Setter, createContext, useContext } from 'solid-js'
import { CanvasToken } from 'src/parser'
import { CanvasFlags, CanvasMouseEvent } from '../types'

export type InternalContextType = {
  setFlag: (key: CanvasFlags, value: boolean) => void
  flags: Record<CanvasFlags, boolean>
  ctx: CanvasRenderingContext2D
  matrix: DOMMatrix
  debug: boolean
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
