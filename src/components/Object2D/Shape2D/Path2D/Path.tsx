import { createToken } from '@solid-primitives/jsx-tokenizer'

import { PathResult } from 'src/d'
import { parser } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

type PathProps = {
  d: PathResult
  close: boolean
}

const Path = createToken(parser, (props: Shape2DProps<PathProps> & PathProps) =>
  createPath2D<PathProps>({
    id: 'Path',
    props,
    defaultProps: {
      close: false,
    },
    path: props => {
      const path2D = new Path2D(props.d.string)
      if (props.close) path2D.closePath()
      return path2D
    },
    bounds: props => [],
  }),
)
export { Path }
