import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createSignal, mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Dimensions, Shape2DProps } from 'src/types'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { createBounds } from 'src/utils/createBounds'
import { createMatrix } from 'src/utils/createMatrix'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import withGroup from 'src/utils/withGroup'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'
import { createParenthood } from 'src/utils/createParenthood'

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
  // const canvas = useInternalContext()
  const resolvedProps = resolveShape2DProps(props, {
    close: true,
    dimensions: { width: 100, height: 100 },
  })
  const context = createUpdatedContext(resolvedProps)
  const parenthood = createParenthood(resolvedProps, context)

  const matrix = createMatrix(resolvedProps)
  const path = createTransformedPath(() => {
    const path = new Path2D()
    if (props.rounded && 'roundRect' in path)
      path.roundRect(
        0,
        0,
        resolvedProps.dimensions.width,
        resolvedProps.dimensions.height,
        props.rounded,
      )
    else
      path.rect(
        0,
        0,
        resolvedProps.dimensions.width,
        resolvedProps.dimensions.height,
      )
    return path
  }, matrix)

  const bounds = createBounds(
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

  const token: Shape2DToken = {
    id: 'Rectangle',
    type: 'Shape2D',
    render: (ctx: CanvasRenderingContext2D) => {
      renderPath(ctx, resolvedProps, path(), context.origin, false)
      parenthood.render(ctx)
    },
    debug: (ctx: CanvasRenderingContext2D) =>
      renderPath(
        ctx,
        defaultBoundsProps,
        bounds().path,
        context.origin,
        context.isSelected(token) || context.isHovered(token),
      ),
    path,
    hitTest: event => setHover(hitTest(token, event, context, resolvedProps)),
  }
  return token
})

export { Rectangle }
