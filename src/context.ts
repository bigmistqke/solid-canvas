import { createContext, useContext } from 'solid-js'
import { Position } from './'

export const CanvasContext = createContext<{
  ctx: CanvasRenderingContext2D
}>()

export const useCanvas = () => useContext(CanvasContext)
