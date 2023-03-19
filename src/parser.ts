import { createTokenizer } from '@solid-primitives/jsx-tokenizer'
import { Accessor } from 'solid-js'
import { CanvasMouseEvent } from './types'

export type ShapeToken = {
  type: 'Shape'
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
  | ShapeToken
  | ColorToken
  | {
      type: 'Group'
      render: (ctx: CanvasRenderingContext2D) => void
      debug: (ctx: CanvasRenderingContext2D) => void
      hitTest: (event: CanvasMouseEvent) => boolean
    }

export const parser = createTokenizer<CanvasToken>({ name: 'solid-canvas' })
