import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'
import { Normalize } from 'src/utils/typehelpers'

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */

const Arc = createToken(
  parser,
  (
    props: Normalize<
      Shape2DProps & {
        close?: boolean
        radius?: number
        angle?: {
          start: number
          end: number
        }
      }
    >,
  ) => {
    const resolvedProps = resolveShape2DProps(props, {
      close: true,
      radius: 10,
      angle: { start: 0, end: 2 * Math.PI },
    })
    const context = createUpdatedContext(resolvedProps)
    const parenthood = createParenthood(resolvedProps, context)

    const matrix = createMatrix(resolvedProps)
    const path = createTransformedPath(() => {
      const path = new Path2D()
      path.arc(
        resolvedProps.radius,
        resolvedProps.radius,
        resolvedProps.radius,
        resolvedProps.angle.start,
        resolvedProps.angle.end,
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
          x: resolvedProps.radius * 2,
          y: 0,
        },
        {
          x: resolvedProps.radius * 2,
          y: resolvedProps.radius * 2,
        },
        {
          x: 0,
          y: resolvedProps.radius * 2,
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
          resolvedProps,
          path(),
          context.origin,
          context.isSelected(token) || context.isHovered(token),
        )
        parenthood.render(ctx)
      },
      debug: (ctx: CanvasRenderingContext2D) =>
        renderPath(
          ctx,
          defaultBoundsProps,
          bounds().path,
          context.origin,
          false,
        ),
      path,
      hitTest: function (event) {
        return hitTest(token, event, context, resolvedProps)
      },
    }
    return token
  },
)

export { Arc }
