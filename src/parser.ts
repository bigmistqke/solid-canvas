import { createTokenizer } from '@solid-primitives/jsx-tokenizer'
import { Accessor } from 'solid-js'
import { CanvasMouseEvent } from './types'

export type Shape2DToken = {
  type: 'Shape2D'
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

export type StaticShape2D = {
  props: any
  type: 'StaticShape2D'
  id: string
  render: (ctx: CanvasRenderingContext2D) => void
}

export type CanvasToken = Shape2DToken | ColorToken | GroupToken | StaticShape2D

export const parser = createTokenizer<CanvasToken>({ name: 'solid-canvas' })
