import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
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

  const internalContext = useInternalContext()

  const image = resolveImage(() => props.image)

  const color = () => {
    return internalContext && image()
      ? internalContext.ctx.createPattern(image()!, merged.repetition)
      : undefined
  }

  return {
    type: 'Color',
    color,
  }
})

export { Pattern }
