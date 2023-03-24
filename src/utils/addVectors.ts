import { Position } from 'src/types'

const addPositions = (...args: Position[]) => {
  const result = { x: 0, y: 0 }

  args.forEach(arg => {
    result.x += arg.x
    result.y += arg.y
  })

  return result
}

export default addPositions
