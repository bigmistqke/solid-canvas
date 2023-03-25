import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createSignal, mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Dimensions, Shape2DProps } from 'src/types'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import useBounds from 'src/utils/useBounds'
import useMatrix from 'src/utils/useMatrix'
import useTransformedPath from 'src/utils/useTransformedPath'
import withGroup from 'src/utils/withGroup'

export type RectangleProps = Shape2DProps & {
  dimensions: Dimensions
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  rounded?:
    | number
    | [all: number]
    | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
    | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]
}

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Rectangle = createToken(parser, (props: RectangleProps) => {
  const canvas = useInternalContext()
  const merged = mergeProps({ ...defaultShape2DProps, close: true }, props)

  const matrix = useMatrix(merged)

  const getPath = () => {
    const path = new Path2D()
    if (props.rounded && 'roundRect' in path)
      path.roundRect(
        0,
        0,
        merged.dimensions.width,
        merged.dimensions.height,
        props.rounded,
      )
    else path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
    return path
  }

  const path = useTransformedPath(getPath, matrix)

  const bounds = useBounds(
    () => [
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
    matrix,
  )

  const [hover, setHover] = createSignal(false)
  createEffect(() => {
    if (hover()) props.onMouseEnter?.()
    else props.onMouseLeave?.()
  })

  return {
    id: 'Rectangle',
    type: 'Shape2D',
    render: (ctx: CanvasRenderingContext2D) => {
      renderPath(ctx, merged, path(), canvas?.origin)
    },
    debug: (ctx: CanvasRenderingContext2D) =>
      renderPath(ctx, defaultBoundsProps, bounds().path, canvas?.origin),
    path,
    hitTest: function (event) {
      const token: Shape2DToken = this
      const result = hitTest(token, event, canvas?.ctx, merged, canvas?.origin)
      setHover(result)
      return result
    },
  }
})

const GroupedRectangle = withGroup(Rectangle)

export { GroupedRectangle as Rectangle }
