import { Position } from 'src/types'

const addPositions = <T extends Position | undefined>(...args: T[]) => {
  let result!: T
  let arg: Position | undefined

  for (arg of args) {
    if (!arg) continue
    if (!result) result = { ...arg } as T
    else {
      result.x += arg.x
      result.y += arg.y
    }
  }

  return result
}

export default addPositions
