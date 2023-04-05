import { Vector } from 'src/types'

export default (position: Vector, matrix: DOMMatrix) =>
  new DOMPoint(position.x, position.y).matrixTransform(matrix)
