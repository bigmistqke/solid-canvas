import { Accessor, JSX } from 'solid-js'
import { RegisterControllerEvents } from './controllers/controllers'
import { CanvasToken } from './parser'
import { RequiredPartially, SingleOrArray } from './utils/typehelpers'

export type Object2DProps = {
  transform?: Transforms
  style?: {
    composite?: Composite
    background?: Color
    opacity?: number
    padding?: number
  }
  children?: SingleOrArray<JSX.Element>
  clip?: Accessor<SingleOrArray<JSX.Element>>
  // controllers?: ((props: Object2DProps, events: ControllerEvents) => any)[]
}

export type Shape2DProps<T = Object> = Shape2DEvents & {
  transform?: Transforms & { '&:hover'?: Transforms }
  style?: Shape2DStyle & { '&:hover'?: Shape2DStyle }

  /**
   * Enable editable handles. Default: false
   */
  editable?: boolean

  /**
   * Set cursor-style when hovering
   */
  hoverStyle?: Shape2DStyle

  children?: SingleOrArray<JSX.Element>
  opacity?: number
  fill?: ExtendedColor
  composite?: Composite
  clip?: Accessor<SingleOrArray<JSX.Element>>
  controllers?: ((
    props: Accessor<T | Omit<Shape2DProps, 'controllers'>>,
    events: RegisterControllerEvents,
  ) => T | Shape2DProps<T>)[]
}

export type ResolvedShape2DProps<T> = Shape2DProps<T> & {
  style: RequiredPartially<
    Shape2DStyle,
    | 'stroke'
    | 'fill'
    | 'lineDash'
    | 'lineCap'
    | 'lineJoin'
    | 'lineWidth'
    | 'pointerEvents'
    | 'opacity'
    | 'cursor'
  >
  transform: Required<Transforms>
}

type Shape2DEvents = {
  /**
   * Set onMouseDown-eventhandler.
   */
  onMouseDown?: SingleOrArray<(event: CanvasMouseEvent) => void>
  /**
   * Set onMouseUp-eventhandler.
   */
  onMouseUp?: SingleOrArray<(event: CanvasMouseEvent) => void>
  /**
   * Set onMouseMove-eventhandler.
   */
  onMouseMove?: SingleOrArray<(event: CanvasMouseEvent) => void>
  /**
   * Set onMouseEnter-eventhandler.
   */
  onMouseEnter?: SingleOrArray<(event: CanvasMouseEvent) => void>
  /**
   * Set onMouseLeave-eventhandler.
   */
  onMouseLeave?: SingleOrArray<(event: CanvasMouseEvent) => void>
}

export interface Transforms {
  /**
   * Default: { x: 0, y: 0 }
   */
  position?: Vector
  /**
   * Default: { x: 0, y: 0 }
   */
  rotation?: number
  /**
   * Default: 0
   */
  skew?: Partial<Vector>
  /**
   * Set transforms while hovering. Default: undefined
   */
}

export interface Shape2DStyle {
  /**
   * Default: 'transparent'
   */
  fill?: ExtendedColor | undefined
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

  shadow?: {
    blur?: number
    color?: Color
    offset?: Vector
  }

  /**
   * Set the ctx.globalCompositeOperation. Default: source-over
   */
  composite?: Composite

  /**
   * Sets ctx.globalAlpha. Default: 1
   */
  opacity?: number

  /**
   * Set cursor-style when hovering. Default: 'default'
   */
  cursor?: CursorStyle
  /**
   * Set pointerEvents. Default: false
   */
  pointerEvents?: boolean
}

export type Vector = {
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
export type ExtendedColor =
  | Color
  | CanvasGradient
  | CanvasPattern
  | JSX.Element
  | null

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

export type CanvasMouseEventTypes =
  | 'onMouseDown'
  | 'onMouseMove'
  | 'onMouseUp'
  | 'onMouseLeave'
  | 'onMouseEnter'

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  type: CanvasMouseEventTypes
  position: Vector
  delta: Vector
  propagation: boolean
  target: CanvasToken[]
  cursor: CursorStyle
}

export type CanvasMouseEventListener = (event: CanvasMouseEvent) => void

export type BezierPoint = CubicPoint | QuadraticPoint

export type CubicPoint = {
  point: Vector
  control: Vector
  oppositeControl?: Vector
}
export type QuadraticPoint = {
  point: Vector
  control?: Vector
}

export type CursorStyle =
  | 'auto'
  | 'default'
  | 'crosshair'
  | 'help'
  | 'move'
  | 'progress'
  | 'text'
  | 'wait'
  | 'e-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'n-resize'
  | 'se-resize'
  | 'sw-resize'
  | 's-resize'
  | 'pointer'
  | 'none'
  | undefined
