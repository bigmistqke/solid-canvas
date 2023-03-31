import { createToken } from '@solid-primitives/jsx-tokenizer'

import { createCubic } from 'src/d/d'
import { parser } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import { createPath2D } from 'src/utils/createPath2D'

export type BezierProps = {
  points: {
    point: Position
    control: Position
    oppositeControl?: Position
  }[]
  close?: boolean
}

/**
 * Paints a cubic bezier to the context
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */
const Bezier = createToken(
  parser,
  (props: Shape2DProps<BezierProps> & BezierProps) =>
    createPath2D<BezierProps>({
      id: 'Bezier',
      props,
      defaultProps: { close: false },
      path: props => {
        const svgString = createCubic(props.points).string
        const path2D = new Path2D(svgString)
        if (props.close) path2D.closePath()
        return path2D
      },
      bounds: props =>
        props.points
          .map(Object.values)
          .flat()
          .filter(v => typeof v === 'object'),
    }),
)

export { Bezier }
