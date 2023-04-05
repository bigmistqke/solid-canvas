import { Vector, QuadraticPoint } from 'src/types'
import addPositions from 'src/utils/addPositions'
import { CreatePathParams, PathResult } from './d'
import { linkTo } from './linkTo'

function createQuadratic(values: QuadraticPoint[]): PathResult
function createQuadratic(
  values: QuadraticPoint[] | QuadraticPoint,
  previous: CreatePathParams,
): PathResult
function createQuadratic(
  values: QuadraticPoint[] | QuadraticPoint,
  previous?: CreatePathParams,
) {
  let value: QuadraticPoint
  let point: Vector
  let control: Vector | undefined
  let command = previous?.command ?? 'M'
  let string = previous?.string ?? ''
  let i = 0
  values = Array.isArray(values) ? values : [values]
  for (value of values) {
    point = value.point
    control = addPositions(value?.control, point)
    if (command === 'M') {
      if (!control) {
        console.error(
          'first point in quadratic curve needs to have a defined control point',
        )
        return new Path2D()
      }
      string += `M${point.x},${point.y} Q${control.x},${control.y} `
      command = 'Q'
    } else {
      point = value.point as Vector
      control = addPositions(value.control, point)

      if (control && command !== 'Q') {
        string += 'Q'
        command = 'Q'
      }

      if (control) {
        string += `${point.x},${point.y} ${control.x},${control.y} `
      } else {
        string += `${point.x},${point.y} `
      }

      if (!control && command !== 'T' && value !== values[values.length - 1]) {
        string += 'T'
        command = 'T'
      }
    }
    i++
  }

  const data = { type: 'Quadratic', values } as const

  return linkTo({
    command,
    string,
    values: previous ? [...previous.values, data] : [data],
  })
}

export { createQuadratic }
