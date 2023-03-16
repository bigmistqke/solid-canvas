import { createContext, useContext } from 'solid-js'
import { Position } from 'src'
import { CanvasMouseEvent } from './parser'

export const CanvasContext = createContext<{
  ctx: CanvasRenderingContext2D
  origin: Position
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
