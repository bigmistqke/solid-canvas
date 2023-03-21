import { Position } from 'src/types'

const addPositions = (a: Position, b: Position) => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

export default addPositions
