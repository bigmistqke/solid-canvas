import { Position } from 'src/types'
import { CreatePathParams, PathResult } from './d'
import { linkTo } from './linkTo'
function createLine(points: Position[]): PathResult
function createLine(
  values: Position[] | Position,
  previous: CreatePathParams,
): PathResult
function createLine(
  values: Position[] | Position,
  previous?: CreatePathParams,
) {
  let point: Position
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
