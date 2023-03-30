import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultShape2DProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { PathResult } from 'src/path'
import { Shape2DProps } from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'

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
    const canvas = useInternalContext()
    const resolvedProps = resolveShape2DProps(props, { close: false })
    const matrix = createMatrix(resolvedProps)
    const context = createUpdatedContext(resolvedProps)
    const parenthood = createParenthood(resolvedProps, context)
    const path = createTransformedPath(() => {
      const path2D = new Path2D(props.d.string)
      if (resolvedProps.close) path2D.closePath()
      return path2D
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Path',
      render: ctx => {
        renderPath(
          ctx,
          resolvedProps,
          path(),
          canvas?.origin,
          canvas?.isSelected(token) || canvas?.isHovered(token),
        )
        parenthood.render(ctx)
      },
      debug: ctx => {},
      path,
      hitTest: event => {
        return hitTest(token, event, canvas, resolvedProps)
      },
    }
    return token
  },
)

export { Path }
