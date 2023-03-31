import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { PathResult } from 'src/d'
import { Shape2DProps } from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { createControlledProps } from 'src/utils/createControlledProps'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Path = createToken(
  parser,
  (
    props: Shape2DProps & {
      d: PathResult
      close: boolean
    },
  ) => {
    const controlled = createControlledProps(
      mergeShape2DProps(props, {
        close: false,
      }),
    )
    const context = createUpdatedContext(() => controlled.props)
    const parenthood = createParenthood(props, context)

    const matrix = createMatrix(controlled.props)
    const path = createTransformedPath(() => {
      const path2D = new Path2D(props.d.string)
      if (controlled.props.close) path2D.closePath()
      return path2D
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Path',
      render: ctx => {
        renderPath(
          ctx,
          controlled.props,
          path(),
          context.origin,
          context.isSelected(token) || context.isHovered(token),
        )
        parenthood.render(ctx)
      },
      debug: ctx => {},
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
  },
)

export { Path }
