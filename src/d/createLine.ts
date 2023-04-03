import { Vector } from 'src/types'
import { CreatePathParams, PathResult } from './d'
import { linkTo } from './linkTo'
function createLine(points: Vector[]): PathResult
function createLine(
  values: Vector[] | Vector,
  previous: CreatePathParams,
): PathResult
function createLine(values: Vector[] | Vector, previous?: CreatePathParams) {
  let point: Vector
  let string = previous?.string ?? ''
  let command = previous?.command ?? 'M'
  values = Array.isArray(values) ? values : [values]

  for (point of values) {
    if (command === 'M') {
      if (!previous) {
        string += `M ${point.x},${point.y} L `
      } else {
        string += `L ${point.x},${point.y} `
      }
      command = 'L'
    } else {
      string += `${point.x},${point.y} `
    }
  }

  const data = { type: 'Line', values } as const

  return linkTo({
    command,
    string,
    values: previous ? [...previous.values, data] : [data],
  })
}

export { createLine }
