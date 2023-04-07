import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser } from 'src/parser'
import { Vector, Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

type LineProps = {
  points: Vector[]
  close?: boolean
}

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */
const Line = createToken(
  parser,
  (props: Shape2DProps<LineProps> & LineProps) => {
    let path2D: Path2D, point: Vector | undefined, index: number
    return createPath2D<LineProps>({
      id: 'Line',
      props,
      defaultProps: {
        close: false,
      },
      path: props => {
        path2D = new Path2D()
        point = props.points[0]
        path2D.moveTo(point!.x, point!.y)
        index = 0
        while ((point = props.points[index])) {
          path2D.lineTo(point.x, point.y)
          index++
        }
        if (props.close) path2D.closePath()

        return path2D
      },
      bounds: props => props.points,
    })
  },
)
export { Line }
