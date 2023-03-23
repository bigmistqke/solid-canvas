import { Position } from 'src/types'

export default (position: Position, matrix: DOMMatrix) =>
  new DOMPoint(position.x, position.y).matrixTransform(matrix)
