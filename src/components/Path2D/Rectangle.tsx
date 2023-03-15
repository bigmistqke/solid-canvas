import { createToken } from '@solid-primitives/jsx-parser'
import { mergeProps } from 'solid-js'

import { Dimensions, Position, useCanvas } from '../..'
import { parser } from '../../parser'
import { defaultPath2DProps, filterPath2DProps, Path2DProps, transformPath } from './'

const Rectangle = createToken(
  parser,
  (
    props: Path2DProps & {
      position: Position
      dimensions: Dimensions
    },
  ) => {
    const merged = mergeProps({ ...defaultPath2DProps, close: true }, props)
    const filteredProps = filterPath2DProps(merged)

    const path = transformPath(merged, () => {
      const path = new Path2D()
      path.rect(
        merged.position.x,
        merged.position.y,
        merged.dimensions.width,
        merged.dimensions.height,
      )
      return path
    })

    return {
      props: filteredProps,
      type: 'Path2D',
      path,
    }
  },
)

export { Rectangle }
