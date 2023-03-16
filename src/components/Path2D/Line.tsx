import { createToken } from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'

import { Position } from 'src'
import { parser } from 'src/parser'
import { defaultPath2DProps, filterPath2DProps, Path2DProps, transformPath } from '.'

const Line = createToken(
  parser,
  (
    props: Path2DProps & {
      points: Position[]
      close: boolean
    },
  ) => {
    const merged = mergeProps({ ...defaultPath2DProps, close: true }, props)
    const filteredProps = filterPath2DProps(merged)

    const path = transformPath(merged, () => {
      const result = new Path2D()
      let point = props.points[0]
      result.moveTo(point!.x, point!.y)
      let i = 0
      while ((point = props.points[i])) {
        result.lineTo(point.x, point.y)
        i++
      }
      if (merged.close) result.closePath()
      return result
    })

    return {
      props: filteredProps,
      type: 'Path2D',
      path,
    }
  },
)

export { Line }
