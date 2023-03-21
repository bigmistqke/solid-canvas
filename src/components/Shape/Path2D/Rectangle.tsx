import { createToken, TokenElement } from '@solid-primitives/jsx-tokenizer'
import { createEffect, JSX, mergeProps, splitProps } from 'solid-js'

import { CanvasToken, GroupToken, parser, ShapeToken } from 'src/parser'
import { ShapeProps, Dimensions, Normalize } from 'src/types'
import { defaultBoundsProps, defaultShapeProps } from 'src/utils/defaultProps'
import useBounds from 'src/utils/useBounds'
import useMatrix from 'src/utils/useMatrix'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import transformPath from 'src/utils/transformPath'
import useDraggable from 'src/utils/useDraggable'
import { useCanvas } from 'src/context'
import { Group, GroupProps } from 'src/components/Group'
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
      }
    >,
  ) => {
    const canvas = useCanvas()
    const merged = mergeProps({ ...defaultShapeProps, close: true }, props)
    const [dragPosition, dragEventHandler] = useDraggable()

    const matrix = useMatrix(merged, dragPosition)

    const getPath = () => {
      const path = new Path2D()
      path.rect(0, 0, merged.dimensions.width, merged.dimensions.height)
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
        console.log('RENDER RECTANGLE')
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
