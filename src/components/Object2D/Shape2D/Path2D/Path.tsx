import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultShape2DProps } from 'src/defaultProps'
import { PathResult } from 'src/path'
import { parser, Shape2DToken } from 'src/parser'
import { Shape2DProps } from 'src/types'
import { createMatrix } from 'src/utils/createMatrix'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import withGroup from 'src/utils/withGroup'

/**
 * Paints a straight line to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
 */

const Path = createToken(
  parser,
  (
    props: Shape2DProps & {
      d: PathResult
    },
  ) => {
    const canvas = useInternalContext()
    const merged = mergeProps({ ...defaultShape2DProps, close: false }, props)

    const matrix = createMatrix(merged)

    const path = createTransformedPath(() => {
      // calculate path
      console.log('props.d.string', props.d.string)
      const path2D = new Path2D(props.d.string)

      if (merged.close) path2D.closePath()

      return path2D
    }, matrix)

    const token: Shape2DToken = {
      type: 'Shape2D',
      id: 'Path',
      render: ctx => {
        renderPath(
          ctx,
          merged,
          path(),
          canvas?.origin,
          canvas?.isSelected(token) || canvas?.isHovered(token),
        )
      },
      debug: ctx => {},
      path,
      hitTest: event => {
        return hitTest(token, event, canvas, merged)
      },
    }
    return token
  },
)

const GroupedPath = withGroup(Path)

export { GroupedPath as Path }
