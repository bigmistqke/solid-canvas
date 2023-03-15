import { Accessor, createMemo, splitProps } from 'solid-js'
import { ExtendedColor } from 'src'
import { CanvasMouseEvent } from 'src/parser'

export type Path2DProps = {
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

export const defaultPath2DProps = {
  position: { x: 0, y: 0 },
  dimensions: { width: 0, height: 0 },
  stroke: 'black',
  rotation: 0,
  fill: 'transparent',
  dash: [],
  lineWidth: 2,
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
  const memo = createMemo(path)
  return createMemo(() => {
    const untransformed = memo()

    if (!props.rotation && !props.skewX && !props.skewY) return untransformed

    const transformed = new Path2D()
    const matrix = new DOMMatrix()

    matrix.rotateSelf(props.rotation)
    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    transformed.addPath(untransformed, matrix)
    return transformed
  })
}
