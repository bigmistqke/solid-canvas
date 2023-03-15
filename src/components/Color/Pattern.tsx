import { createToken } from '@solid-primitives/jsx-parser'
import { createEffect, createMemo, JSX, mergeProps, on, useContext } from 'solid-js'

import { Color, Position, useCanvas } from '../..'
import { parser } from '../../parser'

type PatternProps = {
  image:
    | HTMLImageElement
    | HTMLVideoElement
    | SVGImageElement
    | HTMLCanvasElement
    | ImageBitmap
    | OffscreenCanvas
    | string

  repetition?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
}

const HIDE = document.createElement('div')

const Pattern = createToken(parser, (props: PatternProps) => {
  const merged = mergeProps({ repetition: 'no-repeat' }, props)

  const context = useCanvas()

  // props.image.addEventListener?.('load', () => console.log('ok'))

  /* createEffect(() => {
    if (props.image instanceof HTMLImageElement || props.image instanceof HTMLVideoElement) {
      console.log('this happens')
      HIDE.append(props.image)
    }
  }) */

  console.log('REMOUNT!!')

  const media = createMemo(
    on(
      () => props.image,
      () => {
        console.log('props.image')
        if (typeof props.image === 'string') {
          console.log('MEDIA')
          const split = props.image.split('.')
          const extension = split[split.length - 1]
          if (!extension) return
          if (['mov', 'mp4', 'ogg', 'webm'].includes(extension?.toLowerCase())) {
            const media = document.createElement('video')
            media.autoplay = true
            media.muted = true
            media.addEventListener('load', () => console.log('loaded!'))
            media.src = props.image
            // HIDE.append(media)
            return media
            // return context.ctx.createPattern(media, merged.repetition)
          }
          if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension?.toLowerCase())) {
            const media = document.createElement('img')
            media.src = props.image
            return media
            // return context.ctx.createPattern(media, merged.repetition)
          }
          console.error('invalid media-type:', extension)
          return
        }
      },
    ),
  )

  const color = () => {
    if (!context || !props.image) return
    if (typeof props.image === 'string') {
      const m = media()
      return m ? context.ctx.createPattern(m, merged.repetition) : undefined
    }

    /* if (props.image instanceof HTMLImageElement || props.image instanceof HTMLVideoElement) {
      if (!HIDE.contains(props.image)) HIDE.append(props.image)
    } */

    const pattern = context.ctx.createPattern(props.image, merged.repetition)
    return pattern
  }

  return {
    type: 'Color',
    color,
  }
})

export { Pattern }
