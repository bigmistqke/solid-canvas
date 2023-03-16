import { createContext, useContext } from 'solid-js'
import { Position } from 'src'

export const CanvasContext = createContext<{
  ctx: CanvasRenderingContext2D
  origin: Position
}>()

export const useCanvas = () => useContext(CanvasContext)
