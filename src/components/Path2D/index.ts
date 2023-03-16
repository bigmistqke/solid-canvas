import { splitProps } from 'solid-js'
import { Color, Composite, ExtendedColor, Position } from 'src'
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

  composite?: Composite

  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}

export type ResolvedPath2DProps = Required<
  Omit<Path2DProps, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'>
> &
  Pick<Path2DProps, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'composite' | 'shadow'>

export const defaultPath2DProps: ResolvedPath2DProps = {
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
