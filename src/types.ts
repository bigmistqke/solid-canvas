import { Accessor, JSX } from 'solid-js'
import { RegisterControllerEvents } from './controllers'
import { CanvasToken } from './parser'
import { RequiredPartially, SingleOrArray } from './utils/typehelpers'

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

export type Object2DProps = {
  /**
   * Defaults to { x: 0, y: 0}
   */
  position?: Position
  children?: JSX.Element | JSX.Element[]
  opacity?: number
  fill?: ExtendedColor
  composite?: Composite
  clip?: Accessor<JSX.Element | JSX.Element[]>
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
   * Default: { x: 0, y: 0 }
   */
  position?: Position
  /**
   * Default: { x: 0, y: 0 }
   */
  rotation?: number
  /**
   * Default: 0
   */
  skewX?: number
  /**
   * Default: 0
   */
  skewY?: number
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
}

export type Shape2DProps<T = Object> = Shape2DStyle &
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

    children?: JSX.Element | JSX.Element[]
    opacity?: number
    fill?: ExtendedColor
    composite?: Composite
    clip?: Accessor<JSX.Element | JSX.Element[]>
    controllers?: ((
      props: Accessor<T | Shape2DProps<T>>,
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
  position: Position
  delta: Position
  propagation: boolean
  target: CanvasToken[]
  cursor: CursorStyle
}

export type BezierPoint = CubicPoint | QuadraticPoint

export type CubicPoint = {
  point: Position
  control: Position
  oppositeControl?: Position
}
export type QuadraticPoint = {
  point: Position
  control?: Position
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
