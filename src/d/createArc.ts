import { Position } from 'src/types'
import { CreatePathParams } from './d'
import { linkTo } from './linkTo'

export type ArcParams = {
  radius: Position | number
  position: {
    start: Position
    end: Position
  }
  select?: {
    long?: boolean
    flip?: boolean
  }
  angle?: number
}

const createArc = (params: ArcParams, previous?: CreatePathParams) => {
  const command = 'A'
  let string = previous?.string ?? ''
  string += `A ${params.position.start.x},${params.position.start.y} ${
    typeof params.radius === 'object'
      ? params.radius.x + ' ' + params.radius.y
      : params.radius
  } ${params.angle ?? 0}  ${params.select?.long ?? 0} ${
    params.select?.flip ?? 0
  } ${params.position.end.x} ${params.position.end.y}`

  const data = { type: 'Arc', ...params } as const

  return linkTo({
    command,
    string,
    values: previous?.values ? [...previous.values, data] : [data],
  })
}

export { createArc }
