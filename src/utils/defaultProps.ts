import { ResolvedShapeProps } from 'src/types'

const defaultShapeProps: ResolvedShapeProps = {
  position: { x: 0, y: 0 },
  stroke: 'black',
  rotation: 0,
  fill: 'transparent',
  lineDash: [],
  lineCap: 'butt',
  lineJoin: 'round',
  miterLimit: 10,
  lineWidth: 2,
  skewX: 0,
  skewY: 0,
  draggable: false,
  pointerEvents: true,
  opacity: 1,
}

const defaultBoundsProps: ResolvedShapeProps = {
  position: { x: 0, y: 0 },
  stroke: 'grey',
  rotation: 0,
  fill: 'transparent',
  lineDash: [],
  lineCap: 'butt',
  lineJoin: 'round',
  miterLimit: 10,
  lineWidth: 1,
  skewX: 0,
  skewY: 0,
  draggable: false,
  pointerEvents: true,
  opacity: 1,
}

export { defaultShapeProps, defaultBoundsProps }
