import { createToken } from '@solid-primitives/jsx-tokenizer'

import { PathResult } from 'src/d/d'
import { parser } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

type PathProps = {
  d: PathResult
  style: {
    close?: boolean
  }
}

const Path = createToken(
  parser,
  (props: Shape2DProps<PathProps> & PathProps) => {
    let path2D: Path2D
    return createPath2D<PathProps>({
      id: 'Path',
      props,
      defaultStyle: {
        close: false,
      },
      path: props => {
        path2D = new Path2D(props.d.string)
        if (props.style.close) path2D.closePath()
        return path2D
      },
      bounds: props => [],
    })
  },
)
export { Path }
