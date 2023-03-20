import { Accessor, createMemo } from 'solid-js'

const getBounds = (points: Accessor<{ x: number; y: number }[]>, matrix: Accessor<DOMMatrix>) =>
  createMemo(() => {
    // calculate bounds
    const transformedPoints = points().map(({ x, y }) =>
      new DOMPoint(x, y).matrixTransform(matrix()),
    )
    const bounds = {
      x: {
        min: Infinity,
        max: -Infinity,
      },
      y: {
        min: Infinity,
        max: -Infinity,
      },
    }
    transformedPoints.forEach(({ x, y }) => {
      if (x < bounds.x.min) bounds.x.min = x
      if (x > bounds.x.max) bounds.x.max = x
      if (y < bounds.y.min) bounds.y.min = y
      if (y > bounds.y.max) bounds.y.max = y
    })

    const dimensions = {
      width: bounds.x.max - bounds.x.min,
      height: bounds.y.max - bounds.y.min,
    }
    const position = {
      x: bounds.x.min,
      y: bounds.y.min,
    }

    const path = new Path2D()
    path.rect(position.x, position.y, dimensions.width, dimensions.height)

    return {
      path,
      position,
      dimensions,
    }
  })

export default getBounds
