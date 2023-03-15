import { JSX } from 'solid-js'

export { Canvas } from './components/Canvas'
export { Gradient } from './components/Color/Gradient'
export { Pattern } from './components/Color/Pattern'
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

export type Color = RGB | HSL | string
export type ExtendedColor = Color | CanvasGradient | CanvasPattern | JSX.Element | null
