import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { parser, ShapeToken } from 'src/parser'
import { Dimensions, Normalize, ShapeProps } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useBounds from 'src/utils/useBounds'
import useDraggable from 'src/utils/useDraggable'
import useMatrix from 'src/utils/useMatrix'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Rectangle = createToken(
  parser,
  (
    props: Normalize<
      ShapeProps & {
        dimensions: Dimensions
        rounded?:
          | number
          | [all: number]
          | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
          | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]
      }
    >,
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShapeProps, close: true }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)

    const getPath = () => {
      const path = new Path2D()
      if (props.rounded)
        path.roundRect(0, 0, merged.dimensions.width, merged.dimensions.height, props.rounded)
      else path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
      return path
    }

    const path = transformPath(getPath, matrix)

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

    return {
      id: 'Rectangle',
      type: 'Shape',
      render: (ctx: CanvasRenderingContext2D) => {
        renderPath(ctx, merged, path())
      },
      debug: (ctx: CanvasRenderingContext2D) => renderPath(ctx, defaultBoundsProps, bounds().path),
      path,
      hitTest: function (event) {
        const token: ShapeToken = this
        return hitTest(token, event, canvas?.ctx, merged, dragEventHandler)
      },
    }
  },
)

const GroupedRectangle = withGroup(Rectangle)

export { GroupedRectangle as Rectangle }
