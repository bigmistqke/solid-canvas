import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createMemo, JSX, mergeProps, on, useContext } from 'solid-js'

import { Color, Image, Position, useCanvas } from 'src'
import { parser } from 'src/parser'
import resolveImage from 'src/utils/resolveImage'

type PatternProps = {
  image: Image
  repetition?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
}

const HIDE = document.createElement('div')

const Pattern = createToken(parser, (props: PatternProps) => {
  const merged = mergeProps({ repetition: 'no-repeat' }, props)

  const context = useCanvas()

  const image = resolveImage(() => props.image)

  const color = () => {
    return context && image() ? context.ctx.createPattern(image()!, merged.repetition) : undefined
  }

  return {
    type: 'Color',
    color,
  }
})

export { Pattern }
