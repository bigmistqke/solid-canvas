import { Accessor, createMemo, splitProps } from 'solid-js'
import { ExtendedColor, Position, useCanvas } from 'src'
import { getExtendedColor } from 'src/utils/getColor'
import { CanvasMouseEvent, Path2DToken } from 'src/parser.js'

export type Path2DProps = {
  position?: Position

  stroke?: ExtendedColor
  lineWidth?: number
  fill?: ExtendedColor
  dash?: number[]

  skewX?: number
  skewY?: number
  rotation?: number

  onMouseDown?: (event: CanvasMouseEvent) => void
  onMouseMove?: (event: CanvasMouseEvent) => void
  onMouseUp?: (event: CanvasMouseEvent) => void
}

type Path2DPropsWithoutEvents = Omit<Path2DProps, 'onMouseDown' | 'onMouseMove' | 'onMouseUp'>

export const defaultPath2DProps: Required<Path2DPropsWithoutEvents> = {
  position: { x: 0, y: 0 },
  stroke: 'black',
  rotation: 0,
  fill: 'transparent',
  dash: [],
  lineWidth: 2,
  skewX: 0,
  skewY: 0,
}

export const filterPath2DProps = <T extends Record<string, any>>(props: T) =>
  splitProps(props, [
    'fill',
    'dash',
    'stroke',
    'lineWidth',
    'onMouseDown',
    'onMouseUp',
    'onMouseMove',
  ])[0]

export const transformPath = (props: Path2DProps, path: Accessor<Path2D>) => {
  const context = useCanvas()

  const memo = createMemo(path)
  return createMemo(() => {
    const untransformed = memo()

    console.log('context?.origin.x', context?.origin.x, untransformed)

    const position = {
      x: (props.position?.x ?? 0) + (context?.origin.x ?? 0),
      y: (props.position?.y ?? 0) + (context?.origin.y ?? 0),
    }

    // if (!props.rotation && !props.skewX && !props.skewY) return untransformed

    const transformed = new Path2D()
    const matrix = new DOMMatrix()

    matrix.rotateSelf(props.rotation)

    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    // these lines are necessary because skewing causes horizontal/vertical offset
    const point = new DOMPoint(position.x, position.y)
    const offset = point.matrixTransform(matrix)
    matrix.translateSelf(position.x + point.x - offset.x, position.y + point.y - offset.y)

    transformed.addPath(untransformed, matrix)

    return transformed
  })
}

export const renderPath = (
  ctx: CanvasRenderingContext2D,
  props: Required<Path2DPropsWithoutEvents>,
  path: Path2D,
) => {
  ctx.setLineDash(props.dash)
  ctx.strokeStyle = getExtendedColor(props.stroke) ?? 'black'
  ctx.fillStyle = getExtendedColor(props.fill) ?? 'transparent'
  ctx.lineWidth = props.lineWidth
  ctx.fill(path)
  ctx.stroke(path)
  ctx.setLineDash([])
}

const isPointInPath = (event: CanvasMouseEvent, path: Path2D) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  // if (!token.props.fill) return false
  return event.ctx.isPointInPath(path, event.position.x, event.position.y)
}
const isPointInStroke = (event: CanvasMouseEvent, path: Path2D) => {
  // TODO:  can not check for token.props.fill as it would re-mount ColorTokens
  // if (!token.props.stroke) return false
  return event.ctx.isPointInStroke(path, event.position.x, event.position.y)
}

export const isPointInShape = (event: CanvasMouseEvent, path: Path2D) => {
  return isPointInPath(event, path) || isPointInStroke(event, path)
}
