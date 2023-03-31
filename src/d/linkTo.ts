import { CubicPoint, Position, QuadraticPoint } from 'src/types'
import { createCubic, CreatePathParams } from '.'
import { ArcParams, createArc } from './createArc'
import { createLine } from './createLine'
import { createQuadratic } from './createQuadratic'

const moveTo = (position: Position, previous: CreatePathParams) => {
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
  toLine: (points: Position[] | Position) => createLine(points, arg),
  toArc: (options: ArcParams) => createArc(options, arg),
  to: (position: Position) => moveTo(position, arg),
})

export { linkTo }
