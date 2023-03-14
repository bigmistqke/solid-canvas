export { Canvas } from './components/Canvas'
export { Line } from './components/Path2D/Line'
export { Rectangle } from './components/Path2D/Rectangle'
export { useCanvas } from './context'

export type Position = {
  x: number
  y: number
}
export type Dimensions = {
  width: number
  height: number
}
export type RGB = {
  r: number
  g: number
  b: number
}
export type HSL = {
  h: number
  s: number
  l: number
}

export type Color = RGB | HSL | string | CanvasGradient | CanvasPattern
