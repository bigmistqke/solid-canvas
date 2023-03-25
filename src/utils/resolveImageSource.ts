import { Accessor, createResource } from 'solid-js'
import { ImageSource } from 'src/types'

const loadImageSource = (media: ImageSource) =>
  new Promise<Exclude<ImageSource, string>>(resolve => {
    if (typeof media !== 'string') {
      resolve(media)
      return
    }
    const split = media.split('.')
    const extension = split[split.length - 1]
    if (!extension) return
    if (['mov', 'mp4', 'ogg', 'webm'].includes(extension?.toLowerCase())) {
      const video = document.createElement('video')
      video.autoplay = true
      video.muted = true
      video.addEventListener('load', () => console.log('loaded!'))
      video.src = media
      video.oncanplay = event => {
        console.log('loaded')
        resolve(video)
      }
      return
    }
    if (
      ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension?.toLowerCase())
    ) {
      const image = document.createElement('img')
      image.onload = event => {
        console.log('loaded')
        resolve(image)
      }
      image.src = media
      return
    }
    console.error('invalid media-type:', extension)
  })

const resolveImageSource = (image: Accessor<ImageSource>) => {
  const [result] = createResource(image, loadImageSource)
  return result
}

export default resolveImageSource
