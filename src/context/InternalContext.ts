import { createContext, useContext } from 'solid-js'
import { CanvasToken } from 'src/parser'
import { CanvasMouseEvent, Matrix } from '../types'

export type InternalContextType = {
  ctx: CanvasRenderingContext2D
  matrix: DOMMatrix
  debug: boolean
  selected: CanvasToken | undefined
  hovered: CanvasToken | undefined
  isSelected: (token: CanvasToken) => boolean
  isHovered: (token: CanvasToken) => boolean
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
