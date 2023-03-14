import { createJSXParser } from '@solid-primitives/jsx-parser'
import { Position } from './'

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  position: Position
  delta: Position
  stopPropagation: () => void
  target: CanvasToken[]
}

export type CanvasToken = {
  render: (ctx: CanvasRenderingContext2D) => void
  mouseDown: (event: CanvasMouseEvent) => boolean
  mouseMove: (event: CanvasMouseEvent) => boolean
  mouseUp: (event: CanvasMouseEvent) => boolean
}

export const parser = createJSXParser<CanvasToken>({ name: 'solid-canvas' })
