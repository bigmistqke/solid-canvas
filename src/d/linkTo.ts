import { CubicPoint, Vector, QuadraticPoint } from 'src/types'
import { createCubic, CreatePathParams } from './d'
import { ArcParams, createArc } from './createArc'
import { createLine } from './createLine'
import { createQuadratic } from './createQuadratic'

const moveTo = (position: Vector, previous: CreatePathParams) => {
  let string = previous.string ?? ''
  string += `M ${position.x},${position.y} `
  return linkTo({
    command: 'M',
    string,
    values: [...previous.values, { type: 'Move', position }],
  })
}

const linkTo = (arg: CreatePathParams) => ({
  ...arg,
  toQuadratic: (points: QuadraticPoint[] | QuadraticPoint) =>
    createQuadratic(points, arg),
  toCubic: (points: CubicPoint[] | CubicPoint) => createCubic(points, arg),
  toLine: (points: Vector[] | Vector) => createLine(points, arg),
  toArc: (options: ArcParams) => createArc(options, arg),
  to: (position: Vector) => moveTo(position, arg),
})

export { linkTo }
