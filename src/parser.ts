import { createJSXParser } from '@solid-primitives/jsx-parser'
import { Accessor } from 'solid-js'
import { ExtendedColor, Position } from './'

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  position: Position
  delta: Position
  stopPropagation: () => void
  target: CanvasToken[]
}

export type Path2DToken = {
  type: 'Path2D'
  path: Accessor<Path2D>

  props: {
    stroke: ExtendedColor
    fill: ExtendedColor
    dash: number[]
    lineWidth: number

    onMouseDown?: (event: CanvasMouseEvent) => void
    onMouseMove?: (event: CanvasMouseEvent) => void
    onMouseUp?: (event: CanvasMouseEvent) => void
  }
}

export type ColorToken = {
  type: 'Color'
  color: Accessor<CanvasGradient | CanvasPattern | null | undefined>
}

export type CanvasToken = Path2DToken | ColorToken

export const parser = createJSXParser<CanvasToken>({ name: 'solid-canvas' })
