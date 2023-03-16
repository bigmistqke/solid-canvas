import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Color, ExtendedColor } from 'src'
import { CanvasToken } from 'src/parser'

const resolveExtendedColor = (color: ExtendedColor) => {
  if (!color) return
  if (typeof color === 'function') {
    const token = (color as TokenElement<CanvasToken>).data
    if (token?.type !== 'Color') return

    return token.color()
  }
  return resolveColor(color as Color)
}

const resolveColor = (color: Color) => {
  if (!color) return
  if (typeof color === 'object') {
    if ('r' in color) {
      return `rgb(${color.r}, ${color.g}, ${color.b})`
    }
    if ('h' in color) {
      return `hsl(${color.h}, ${color.s}, ${color.l})`
    }
  }
  if (typeof color === 'string') return color
  return undefined
}

export { resolveColor, resolveExtendedColor }
