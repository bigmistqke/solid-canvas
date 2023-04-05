import { Vector } from 'src/types'

const invertPosition = <T extends Vector | undefined>(position: T): T =>
  (position ? { x: position.x * -1, y: position.y * -1 } : undefined) as T
export default invertPosition
