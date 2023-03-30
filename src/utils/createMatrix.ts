import { createMemo } from 'solid-js'
import { Shape2DProps } from 'src/types'

const createMatrix = (props: Shape2DProps) => {
  // const canvas = useInternalContext()
  let position: { x: number; y: number }
  let matrix: DOMMatrix
  const point = new DOMPoint()
  let offset: DOMPoint
  return createMemo(() => {
    /* position = {
      x: props.position?.x ?? 0,
      y: props.position?.y ?? 0,
    } */

    matrix = new DOMMatrix()

    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    // NOTE:  skewing causes a horizontal/vertical offset
    point.x = 0
    point.y = 0
    offset = point.matrixTransform(matrix)
    matrix.translateSelf(point.x - offset.x, point.y - offset.y)

    // NOTE:  the rotation should not be included in this offset-calculation
    matrix.rotateSelf(props.rotation)

    return matrix
  })
}

export { createMatrix }
