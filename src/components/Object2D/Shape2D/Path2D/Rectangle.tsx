import { createToken } from '@solid-primitives/jsx-tokenizer'
import { createEffect, createSignal } from 'solid-js'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Dimensions, Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'

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
  const controlled = createControlledProps(
    mergeShape2DProps(props, {
      dimensions: { width: 10, height: 10 },
    }),
  )
  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(props, context)

  const matrix = createMatrix(controlled.props)
  const path = createTransformedPath(() => {
    const path = new Path2D()
    if (props.rounded && 'roundRect' in path)
      path.roundRect(
        0,
        0,
        controlled.props.dimensions.width,
        controlled.props.dimensions.height,
        props.rounded,
      )
    else
      path.rect(
        0,
        0,
        controlled.props.dimensions.width,
        controlled.props.dimensions.height,
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
      renderPath(ctx, controlled.props, path(), context.origin, false)
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
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
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      const hit = hitTest(token, event, context, controlled.props)
      if (hit) {
        controlled.emit[event.type](event)
      }
      return hit
    },
  }
  return token
})

export { Rectangle }
