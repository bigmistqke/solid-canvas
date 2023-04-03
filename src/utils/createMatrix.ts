import { Accessor, createMemo } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { Vector, Shape2DProps } from 'src/types'

const createMatrix = (props: Shape2DProps, origin?: Accessor<Vector>) => {
  let matrix: DOMMatrix
  const point = new DOMPoint()
  let offset: DOMPoint
  const context = useInternalContext()

  return createMemo(() => {
    matrix = new DOMMatrix()

    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    // NOTE:  skewing causes a horizontal/vertical offset
    point.x = origin?.().x ?? 0
    point.y = origin?.().y ?? 0
    offset = point.matrixTransform(matrix)
    matrix.translateSelf(point.x - offset.x, point.y - offset.y)

    // NOTE:  the rotation should not be included in this offset-calculation
    matrix.rotateSelf(props.rotation)

    return matrix
  })
}

export { createMatrix }
