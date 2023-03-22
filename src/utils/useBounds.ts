import { Accessor, createMemo } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'

const getBounds = (points: Accessor<{ x: number; y: number }[]>, matrix: Accessor<DOMMatrix>) => {
  const canvas = useInternalContext()
  let dimensions: { width: number; height: number }
  let position: { x: number; y: number }
  let path: Path2D
  let point: DOMPoint
  let bounds = {
    x: {
      min: Infinity,
      max: -Infinity,
    },
    y: {
      min: Infinity,
      max: -Infinity,
    },
  }
  return createMemo(() => {
    if (!canvas?.debug) return

    bounds = {
      x: {
        min: Infinity,
        max: -Infinity,
      },
      y: {
        min: Infinity,
        max: -Infinity,
      },
    }

    points().forEach(({ x, y }) => {
      point = new DOMPoint(x, y).matrixTransform(matrix())
      if (point.x < bounds.x.min) bounds.x.min = x
      if (point.x > bounds.x.max) bounds.x.max = x
      if (point.y < bounds.y.min) bounds.y.min = y
      if (point.y > bounds.y.max) bounds.y.max = y
    })

    dimensions = {
      width: bounds.x.max - bounds.x.min,
      height: bounds.y.max - bounds.y.min,
    }
    position = {
      x: bounds.x.min,
      y: bounds.y.min,
    }

    path = new Path2D()
    path.rect(position.x, position.y, dimensions.width, dimensions.height)

    return {
      path,
      position,
      dimensions,
    }
  })
}

export default getBounds
