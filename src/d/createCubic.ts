import { CubicPoint, Vector } from 'src/types'
import addPositions from 'src/utils/addPositions'
import { CreatePathParams, PathResult } from './d'
import { linkTo } from './linkTo'

function createCubic(values: CubicPoint[]): PathResult
function createCubic(
  values: CubicPoint[] | CubicPoint,
  previous: CreatePathParams,
): PathResult
function createCubic(
  values: CubicPoint[] | CubicPoint,
  previous?: CreatePathParams,
) {
  let point: Vector
  let control: Vector | undefined
  let oppositeControl: Vector | undefined
  let string = previous?.string ?? ''
  let command = previous?.command ?? 'M'
  let i = 0
  values = Array.isArray(values) ? values : [values]

  for (const value of values) {
    point = value.point
    control = addPositions(point, value.control)

    if (!control) {
      console.error('cubic paths need to have a control parameter', values)
      return new Path2D()
    }

    if (command === 'M') {
      string += `M${point.x},${point.y} C${control.x},${control.y} `
      command = 'C'
    } else {
      if (
        !value.oppositeControl &&
        command === 'C' &&
        i !== values.length - 1
      ) {
        string += 'S'
        command = 'S'
      } else if (value.oppositeControl && command === 'S') {
        string += 'C'
        command = 'C'
      }

      string += `${control.x},${control.y} ${point.x},${point.y} `
      if (value.oppositeControl) {
        oppositeControl = addPositions(point, value.oppositeControl)
        string += `${oppositeControl.x},${oppositeControl.y} `
      }
    }
    i++
  }

  const data = { type: 'Cubic', values } as const

  return linkTo({
    command,
    string,
    values: previous ? [...previous.values, data] : [data],
  })
}

export { createCubic }
