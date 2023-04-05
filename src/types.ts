import { Accessor, JSX } from 'solid-js'
import { RegisterControllerEvents } from './controllers/controllers'
import { CanvasToken } from './parser'
import { RequiredPartially, SingleOrArray } from './utils/typehelpers'

export type Matrix = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
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

export type Object2DProps = Transforms & {
  /**
   * Defaults to { x: 0, y: 0}
   */
  position?: Vector
  children?: SingleOrArray<JSX.Element>
  opacity?: number
  fill?: ExtendedColor
  composite?: Composite
  clip?: Accessor<SingleOrArray<JSX.Element>>
  background?: Color
  padding?: number
  // controllers?: ((props: Object2DProps, events: ControllerEvents) => any)[]
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

export type Transforms = {
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
}

type Shape2DStyle = {
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
}

export type Shape2DProps<T = Object> = Transforms &
  Shape2DStyle &
  Shape2DEvents & {
    /**
     * Ignore all pointer-events. Default: false
     */
    pointerEvents?: boolean
    /**
     * Enable editable handles. Default: false
     */
    editable?: boolean

    /**
     * Set cursor-style when hovering
     */
    cursor?: CursorStyle

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

export type ResolvedShape2DProps<T = {}> = RequiredPartially<
  Shape2DProps<T>,
  | CanvasMouseEventTypes
  | 'composite'
  | 'fill'
  | 'shadow'
  | 'editable'
  | 'cursor'
  | 'hoverStyle'
  | 'clip'
  | 'children'
  | 'controllers'
>

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
