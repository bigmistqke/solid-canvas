import { createContext, useContext } from 'solid-js'
import { Position } from './'

export const CanvasContext = createContext<{}>()

export const useCanvas = () => useContext(CanvasContext)
