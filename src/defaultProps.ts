import { ResolvedShape2DProps, Shape2DProps } from 'src/types'

const defaultShape2DProps: ResolvedShape2DProps<unknown> = {
  style: {
    stroke: 'black',
    fill: undefined,
    lineDash: [],
    lineCap: 'butt',
    lineJoin: 'round',
    miterLimit: 10,
    lineWidth: 2,
    pointerEvents: false,
    opacity: 1,
    cursor: 'default',
  },
  transform: {
    position: { x: 0, y: 0 },
    rotation: 0,
    skew: {
      x: 0,
      y: 0,
    },
  },
}

const defaultBoundsProps: ResolvedShape2DProps<unknown> = {
  style: {
    stroke: 'grey',
    // fill: 'black',
    fill: false,
    lineDash: [],
    lineCap: 'butt',
    lineJoin: 'round',
    miterLimit: 10,
    lineWidth: 2,
    opacity: 1,
    composite: 'source-over',
    cursor: undefined,
    pointerEvents: false,
  },
  transform: {
    position: { x: 0, y: 0 },
    rotation: 0,
    skew: {
      x: 0,
      y: 0,
    },
  },
}

export { defaultShape2DProps, defaultBoundsProps }
