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
export type RGBA = {
  r: number
  g: number
  b: number
  a: number
}
export type HSL = {
  h: number
  s: number
  l: number
}
export type HSLA = {
  h: number
  s: number
  l: number
  a: number
}

export type Color = RGB | RGBA | HSL | HSLA | string
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
  | 'lighten'
  | 'darken'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

export type Shape2DProps = {
  /**
   * Default: 'transparent'
   */
  fill?: ExtendedColor
  /**
   * Default: 'black'.
   */
  stroke?: ExtendedColor
  /**
   * Default: 2
   */
  lineWidth?: number
  /**
   * Default: []
   */
  lineDash?: number[]
  /**
   * Default: 'butt'
   */
  lineCap?: 'butt' | 'round' | 'square'
  /**
   * Default: 'butt'
   */
  lineJoin?: 'round' | 'bevel' | 'miter'
  /**
   * Default: 'butt'
   */
  miterLimit?: number

  /**
   * Default: 0
   */
  skewX?: number
  /**
   * Default: 0
   */
  skewY?: number
  /**
   * Default: { x: 0, y: 0 }
   */
  rotation?: number
  /**
   * Default: { x: 0, y: 0 }
   */
  position?: Position

  shadow?: {
    blur?: number
    color?: Color
    offset?: Position
  }

  /**
   * Set the ctx.globalCompositeOperation. Default: source-over
   */
  composite?: Composite

  /**
   * Sets ctx.globalAlpha. Default: 1
   */
  opacity?: number

  // Mouse-Events

  /**
   * Makes shape draggable. Default: false
   */
  draggable?: boolean
  /**
   * Ignore all pointer-events. Default: false
   */
  pointerEvents?: boolean

  controls?: boolean

  onDragMove?: (position: Position, event: CanvasMouseEvent) => void

  /**
   * Set onMouseDown-eventhandler.
   */
  onMouseDown?: (event: CanvasMouseEvent) => void
  /**
   * Set onMouseDown-eventhandler.
   */
  onMouseMove?: (event: CanvasMouseEvent) => void
  /**
   * Set onMouseDown-eventhandler.
   */
  onMouseUp?: (event: CanvasMouseEvent) => void
}

export type ResolvedShape2DProps = Required<
  Omit<
    Shape2DProps,
    'onDragMove' | 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'
  >
> &
  Pick<
    Shape2DProps,
    'onDragMove' | 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'
  >

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp'
  position: Position
  delta: Position
  propagation: boolean
  target: CanvasToken[]
}

export type Normalize<T> = T extends (...args: infer A) => infer R
  ? (...args: Normalize<A>) => Normalize<R>
  : { [K in keyof T]: T[K] }
