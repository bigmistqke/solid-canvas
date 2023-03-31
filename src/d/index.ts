import { BezierPoint, CubicPoint, Position, QuadraticPoint } from 'src/types'
import { ArcParams } from './createArc'
import { linkTo } from './linkTo'

export { createArc } from './createArc'
export { createCubic } from './createCubic'
export { createLine } from './createLine'
export { createQuadratic } from './createQuadratic'

export type SVGCommands = 'C' | 'S' | 'Q' | 'T' | 'A' | 'R' | 'M' | 'L'
export type PathResult = ReturnType<typeof linkTo>
export type CreatePathParams = {
  command: SVGCommands
  string: string
  values: (
    | {
        type: 'Quadratic'
        values: QuadraticPoint[]
      }
    | {
        type: 'Cubic'
        values: CubicPoint[]
      }
    | {
        type: 'Line'
        values: Position[]
      }
    | {
        type: 'Move'
        position: Position
      }
    | ({
        type: 'Arc'
      } & ArcParams)
  )[]
}
