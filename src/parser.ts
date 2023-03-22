import { createTokenizer } from '@solid-primitives/jsx-tokenizer'
import { Accessor } from 'solid-js'
import { CanvasMouseEvent } from './types'

export type ShapeToken = {
  type: 'Shape'
  id: string
  hitTest: (event: CanvasMouseEvent) => boolean
  path: Accessor<Path2D>
  render: (ctx: CanvasRenderingContext2D) => void
}

export type ColorToken = {
  type: 'Color'
  color: Accessor<CanvasGradient | CanvasPattern | null | undefined>
}

export type GroupToken = {
  type: 'Group'
  render: (ctx: CanvasRenderingContext2D) => void
  debug: (ctx: CanvasRenderingContext2D) => void
  hitTest: (event: CanvasMouseEvent) => boolean
  paths: Accessor<Path2D[]>
  // clip: Accessor<(ctx: CanvasRenderingContext2D) => void>
}

export type StaticShape = {
  props: any
  type: 'StaticShape'
  id: string
  render: (ctx: CanvasRenderingContext2D) => void
}

export type CanvasToken = ShapeToken | ColorToken | GroupToken | StaticShape

export const parser = createTokenizer<CanvasToken>({ name: 'solid-canvas' })
