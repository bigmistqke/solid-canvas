import { createToken } from '@solid-primitives/jsx-tokenizer'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { mergeShape2DProps } from 'src/utils/resolveShape2DProps'

type ArcProps = {
  close?: boolean
  radius?: number
  angle?: {
    start: number
    end: number
  }
}

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Arc = createToken(parser, (props: Shape2DProps<ArcProps> & ArcProps) => {
  const controlled = createControlledProps(
    mergeShape2DProps(props, {
      close: true,
      radius: 10,
      angle: { start: 0, end: 2 * Math.PI },
    }),
  )
  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(props, context)

  const matrix = createMatrix(controlled.props)
  const path = createTransformedPath(() => {
    const path = new Path2D()
    path.arc(
      controlled.props.radius,
      controlled.props.radius,
      controlled.props.radius,
      controlled.props.angle.start,
      controlled.props.angle.end,
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
        x: controlled.props.radius * 2,
        y: 0,
      },
      {
        x: controlled.props.radius * 2,
        y: controlled.props.radius * 2,
      },
      {
        x: 0,
        y: controlled.props.radius * 2,
      },
    ],
    matrix,
  )

  const token: Shape2DToken = {
    id: 'Arc',
    type: 'Shape2D',
    render: function (ctx: CanvasRenderingContext2D) {
      renderPath(
        ctx,
        controlled.props,
        path(),
        context.origin,
        context.isSelected(token) || context.isHovered(token),
      )
      parenthood.render(ctx)
    },
    debug: (ctx: CanvasRenderingContext2D) =>
      renderPath(ctx, defaultBoundsProps, bounds().path, context.origin, false),
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

export { Arc }
