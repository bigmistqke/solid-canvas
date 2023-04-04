import { Accessor, createMemo, on } from 'solid-js'
import { Matrix, Shape2DProps } from 'src/types'

const createMatrix = (
  props: Shape2DProps,
  matrixValues?: Accessor<Matrix | undefined>,
) => {
  let matrix = new DOMMatrix()
  /* const point = new DOMPoint()
  let offset: DOMPoint
  const context = useInternalContext() */

  return createMemo(
    () => {
      // matrix.setMatrixValue('')
      // matrix.setMatrixValue(origin?.()?.toString() ?? '')
      matrix.a = matrixValues?.()?.a ?? 1
      matrix.b = matrixValues?.()?.b ?? 0
      matrix.c = matrixValues?.()?.c ?? 0
      matrix.d = matrixValues?.()?.d ?? 1
      matrix.e = matrixValues?.()?.e ?? 0
      matrix.f = matrixValues?.()?.f ?? 0

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
