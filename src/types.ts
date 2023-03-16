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
  /**
   * Default: 'black'.
   */
  stroke?: ExtendedColor
  /**
   * Default: 2
   */
  lineWidth?: number
  /**
   * Default: 'transparent'
   */
  fill?: ExtendedColor
  /**
   * Default: []
   */
  lineDash?: number[]

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
   * Set the ctx.globalCompositeOperation
   */
  composite?: Composite

  /**
   * Makes shape draggable. Default: false
   */
  draggable?: boolean
  /**
   * Ignore all pointer-events. Default: false
   */
  pointerEvents?: boolean

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