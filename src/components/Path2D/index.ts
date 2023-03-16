import { Accessor, createEffect, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import { ExtendedColor, Position, useCanvas } from 'src'
import { getExtendedColor } from 'src/utils/getColor'
import { CanvasMouseEvent, CanvasToken, Path2DToken } from 'src/parser.js'

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
