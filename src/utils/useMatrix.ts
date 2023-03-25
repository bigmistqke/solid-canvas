import { Accessor, createMemo } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { Shape2DProps, Position } from 'src/types'

export default (props: Shape2DProps) => {
  // const canvas = useInternalContext()
  let position: { x: number; y: number }
  let matrix: DOMMatrix
  const point = new DOMPoint()
  let offset: DOMPoint
  return createMemo(() => {
    position = {
      x: props.position?.x ?? 0,
      y: props.position?.y ?? 0,
    }

    matrix = new DOMMatrix()

    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    // NOTE:  skewing causes a horizontal/vertical offset
    point.x = position.x
    point.y = position.y
    offset = point.matrixTransform(matrix)
    matrix.translateSelf(
      position.x + point.x - offset.x,
      position.y + point.y - offset.y,
    )

    // NOTE:  the rotation should not be included in this offset-calculation
    matrix.rotateSelf(props.rotation)

    return matrix
  })
}
