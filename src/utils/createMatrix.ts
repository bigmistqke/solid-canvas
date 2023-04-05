import { Accessor, createMemo, on } from 'solid-js'
import { InternalContextType } from 'src/context/InternalContext'
import { Matrix, Shape2DProps } from 'src/types'

const createMatrix = (props: Shape2DProps, context?: InternalContextType) => {
  let matrix = new DOMMatrix()
  /* const point = new DOMPoint()
  let offset: DOMPoint
  const context = useInternalContext() */

  return createMemo(
    () => {
      // matrix.setMatrixValue('')
      // matrix.setMatrixValue(origin?.()?.toString() ?? '')
      matrix.a = context?.matrix.a ?? 1
      matrix.b = context?.matrix.b ?? 0
      matrix.c = context?.matrix.c ?? 0
      matrix.d = context?.matrix.d ?? 1
      matrix.e = context?.matrix.e ?? 0
      matrix.f = context?.matrix.f ?? 0

      matrix.translateSelf(props.position?.x, props.position?.y)
      matrix.skewXSelf(props.skewX)
      matrix.skewYSelf(props.skewY)

      // NOTE:  skewing causes a horizontal/vertical offset
      /* point.x = origin?.().x ?? 0
    point.y = origin?.().y ?? 0
    offset = point.matrixTransform(matrix)
    matrix.translateSelf(point.x - offset.x, point.y - offset.y) */

      // NOTE:  the rotation should not be included in this offset-calculation
      matrix.rotateSelf(props.rotation)

      return matrix
    },
    matrix,
    {
      equals: false,
    },
  )
}

export { createMatrix }
