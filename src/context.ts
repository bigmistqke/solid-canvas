import { createContext, useContext } from 'solid-js'
import { Position, CanvasMouseEvent } from './types'

export const CanvasContext = createContext<{
  ctx: CanvasRenderingContext2D
  origin: Position
  debug: boolean
  addEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
  removeEventListener: (
    type: CanvasMouseEvent['type'],
    callback: (event: CanvasMouseEvent) => void,
  ) => void
}>()

export const useCanvas = () => useContext(CanvasContext)
