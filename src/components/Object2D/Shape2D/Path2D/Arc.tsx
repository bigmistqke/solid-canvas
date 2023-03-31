import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

type ArcProps = {
  close?: boolean
  radius?: number
  angle?: {
    start: number
    end: number
  }
}

/**
 * Paints an elliptic Arc to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Arc = createToken(parser, (props: Shape2DProps<ArcProps> & ArcProps) =>
  createPath2D<ArcProps>({
    id: 'Arc',
    props,
    defaultProps: {
      close: false,
      radius: 10,
      angle: { start: 0, end: 2 * Math.PI },
    },
    path: props => {
      const path = new Path2D()
      path.arc(
        props.radius,
        props.radius,
        props.radius,
        props.angle.start,
        props.angle.end,
      )
      return path
    },
    bounds: props => [
      {
        x: 0,
        y: 0,
      },
      {
        x: props.radius * 2,
        y: 0,
      },
      {
        x: props.radius * 2,
        y: props.radius * 2,
      },
      {
        x: 0,
        y: props.radius * 2,
      },
    ],
  }),
)
export { Arc }
