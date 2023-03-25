import { Position } from 'src/types'

const addPositions = <T extends Position | undefined>(...args: T[]): T => {
  let result!: undefined | Position
  let arg: Position | undefined

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
