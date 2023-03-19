import { createMemo } from 'solid-js'
import { Position } from 'src/types'

export default (position: Position, matrix: DOMMatrix) => {
  const point = new DOMPoint(position.x, position.y)
  return point.matrixTransform(matrix)
}
