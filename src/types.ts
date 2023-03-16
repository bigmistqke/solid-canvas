import { JSX } from 'solid-js'
import { CanvasToken } from './parser'

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

export type ImageSource =
  | HTMLImageElement
  | HTMLVideoElement
  | SVGImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas
  | string

export type Composite =
  | 'source-over'
  | 'source-atop'
  | 'source-in'
  | 'source-out'
  | 'destination-over'
  | 'destination-atop'
  | 'destination-in'
  | 'destination-out'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

export type ShapeProps = {
  position?: Position

  stroke?: ExtendedColor
  lineWidth?: number
  fill?: ExtendedColor
  dash?: number[]

  skewX?: number
  skewY?: number
  rotation?: number

  draggable?: boolean
  pointerEvents?: boolean

  shadow?: {
    blur?: number
    color?: Color
    offset?: Position
  }

  composite?: Composite

  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}

export type ResolvedShapeProps = Required<
  Omit<ShapeProps, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'>
> &
  Pick<ShapeProps, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'>

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp'
  position: Position
  delta: Position
  stopPropagation: () => void
  target: CanvasToken[]
}

export type Normalize<T> = T extends (...args: infer A) => infer R
  ? (...args: Normalize<A>) => Normalize<R>
  : { [K in keyof T]: T[K] }
