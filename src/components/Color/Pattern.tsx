import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useCanvas } from 'src'
import { parser } from 'src/parser'
import { ImageSource } from 'src/types'
import resolveImage from 'src/utils/resolveImageSource'

type PatternProps = {
  image: ImageSource
  repetition?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
}

const HIDE = document.createElement('div')

const Pattern = createToken(parser, (props: PatternProps) => {
  const merged = mergeProps({ repetition: 'no-repeat' }, props)

  const canvas = useCanvas()

  const image = resolveImage(() => props.image)

  const color = () => {
    return canvas && image() ? canvas.ctx.createPattern(image()!, merged.repetition) : undefined
  }

  return {
    type: 'Color',
    color,
  }
})

export { Pattern }
