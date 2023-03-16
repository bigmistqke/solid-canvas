import { splitProps } from 'solid-js'
import { Color, ExtendedColor, Position } from 'src'
import { CanvasMouseEvent } from 'src/parser.js'

export type Path2DProps = {
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

  composite?:
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

  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}

export type Path2DPropsWithoutEvents = Omit<
  Path2DProps,
  'onMouseDown' | 'onMouseMove' | 'onMouseUp'
>

export const defaultPath2DProps: Required<Path2DPropsWithoutEvents> = {
  position: { x: 0, y: 0 },
  stroke: 'black',
  rotation: 0,
  fill: 'transparent',
  dash: [],
  lineWidth: 2,
  skewX: 0,
  skewY: 0,
  draggable: false,
  pointerEvents: true,
}

export const filterPath2DProps = <T extends Record<string, any>>(props: T) =>
  splitProps(props, [
    'fill',
    'dash',
    'stroke',
    'lineWidth',
    'onMouseDown',
    'onMouseUp',
    'onMouseMove',
  ])[0]
