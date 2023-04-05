import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser } from 'src/parser'
import { Dimensions, Shape2DProps } from 'src/types'
import { createPath2D } from '../../../../utils/createPath2D'

export type RectangleProps = {
  dimensions?: Dimensions
  rounded?:
    | false
    | number
    | [all: number]
    | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
    | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]
}

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Rectangle = createToken(
  parser,
  (props: Shape2DProps<RectangleProps> & RectangleProps) =>
    createPath2D<RectangleProps>({
      id: 'Rectangle',
      props,
      defaultProps: {
        dimensions: { width: 10, height: 10 },
        rounded: false,
      },
      path: props => {
        const path = new Path2D()
        if (props.rounded && 'roundRect' in path)
          path.roundRect(
            0,
            0,
            props.dimensions.width,
            props.dimensions.height,
            props.rounded,
          )
        else path.rect(0, 0, props.dimensions.width, props.dimensions.height)
        return path
      },
      bounds: props => [
        {
          x: 0,
          y: 0,
        },
        {
          x: props.dimensions.width,
          y: 0,
        },
        {
          x: props.dimensions.width,
          y: props.dimensions.height,
        },
        {
          x: 0,
          y: props.dimensions.height,
        },
      ],
    }),
)

export { Rectangle }
