import { Vector } from 'src/types'

const addPositions = <T extends Vector | undefined>(...args: T[]): T => {
  let result!: undefined | Vector
  let arg: Vector | undefined

  for (arg of args) {
    if (!arg) return undefined as T
    if (!result) result = { ...arg }
    else {
      result.x += arg.x
      result.y += arg.y
    }
  }

  return result as T
}

export default addPositions
