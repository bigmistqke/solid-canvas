import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

type ArcProps = {
  style: {
    close?: boolean
    radius?: number
    angle?: {
      start: number
      end: number
    }
  }
}

/**
 * Paints an elliptic Arc to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Arc = createToken(parser, (props: Shape2DProps<ArcProps> & ArcProps) => {
  let path: Path2D
  return createPath2D<ArcProps>({
    id: 'Arc',
    props,
    defaultStyle: {
      angle: { start: 0, end: 2 * Math.PI },
      close: false,
      radius: 10,
    },
    path: props => {
      path = new Path2D()
      path.arc(
        props.style.radius ?? 30,
        props.style.radius ?? 30,
        props.style.radius ?? 30,
        props.style.angle.start,
        props.style.angle.end ?? 2 * Math.PI,
      )
      return path
    },
    bounds: props => [
      {
        x: 0,
        y: 0,
      },
      {
        x: props.style.radius * 2,
        y: 0,
      },
      {
        x: props.style.radius * 2,
        y: props.style.radius * 2,
      },
      {
        x: 0,
        y: props.style.radius * 2,
      },
    ],
  })
})
export { Arc }
