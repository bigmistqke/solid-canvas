import { Accessor, createMemo, on } from 'solid-js'
import { Image } from 'src'

export default (image: Accessor<Image>) =>
  createMemo(
    on(image, () => {
      const img = image()
      if (typeof img === 'string') {
        const split = img.split('.')
        const extension = split[split.length - 1]
        if (!extension) return
        if (['mov', 'mp4', 'ogg', 'webm'].includes(extension?.toLowerCase())) {
          const media = document.createElement('video')
          media.autoplay = true
          media.muted = true
          media.addEventListener('load', () => console.log('loaded!'))
          media.src = img
          // HIDE.append(media)
          return media
        }
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension?.toLowerCase())) {
          const media = document.createElement('img')
          media.src = img
          return media
        }
        console.error('invalid media-type:', extension)
        return
      }
      return img
    }),
  )
