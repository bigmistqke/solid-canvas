import { createToken } from '@solid-primitives/jsx-tokenizer'

import { createQuadratic } from 'src/d/d'
import { parser } from 'src/parser'
import { Vector, Shape2DProps } from 'src/types'
import addPositions from 'src/utils/addPositions'
import { createPath2D } from '../../../../utils/createPath2D'

/**
 * Paints a quadratic bezier to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */

type QuadraticPoints = { point: Vector; control?: Vector }[]

export type QuadraticProps = {
  points: QuadraticPoints
  close?: boolean
}

const Quadratic = createToken(
  parser,
  (props: Shape2DProps<QuadraticProps> & QuadraticProps) =>
    createPath2D<QuadraticProps>({
      id: 'Quadratic',
      props,
      defaultProps: {
        close: false,
      },
      path: props => {
        const path2D = new Path2D(createQuadratic(props.points).string)
        if (props.close) path2D.closePath()
        return path2D
      },
      bounds: props =>
        props.points
          .map((point, i) => {
            let result: Vector[] = [point.point]
            if (point.control) {
              const control = addPositions(point.point, point.control)
              const nextPoint = props.points[i + 1]?.point
              if (nextPoint) {
                result.push(control, point.point)
              } else {
                result.push(point.point)
              }
            }
            return result
          })
          .flat(),
    }),
)
export { Quadratic, type QuadraticPoints }
