import { createTokenizer } from '@solid-primitives/jsx-tokenizer'
import { Accessor } from 'solid-js'
import { ExtendedColor, Position } from './'

export type CanvasMouseEvent = {
  ctx: CanvasRenderingContext2D
  type: 'onMouseDown' | 'onMouseMove' | 'onMouseUp'
  position: Position
  delta: Position
  stopPropagation: () => void
  target: CanvasToken[]
}

export type Path2DToken = {
  type: 'Path2D'
  id: string
  hitTest: (event: CanvasMouseEvent) => boolean
  path: Accessor<Path2D>

  clip: (ctx: CanvasRenderingContext2D) => void
  render: (ctx: CanvasRenderingContext2D) => void
}

export type ColorToken = {
  type: 'Color'
  color: Accessor<CanvasGradient | CanvasPattern | null | undefined>
}

export type CanvasToken =
  | Path2DToken
  | ColorToken
  | {
      type: 'Group'
      render: (ctx: CanvasRenderingContext2D) => void
      hitTest: (event: CanvasMouseEvent) => boolean
    }

export const parser = createTokenizer<CanvasToken>({ name: 'solid-canvas' })
