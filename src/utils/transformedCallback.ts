import { Transforms, Vector } from 'src/types'

const transferMatrix = (matrix1: DOMMatrix, matrix2: DOMMatrix) => {
  matrix1.a = matrix2.a
  matrix1.b = matrix2.b
  matrix1.c = matrix2.c
  matrix1.d = matrix2.d
  matrix1.e = matrix2.e
  matrix1.f = matrix2.f
}

const createTransformedCallback = () => {
  let matrix = new DOMMatrix()
  let matrix2 = new DOMMatrix()
  let result: unknown | undefined
  let position: Vector | undefined
  let rotation: number | undefined
  let transform: Partial<Transforms> | undefined
  let left: number
  let top: number

  return <T>(
    ctx: CanvasRenderingContext2D,
    props: { transform?: Transforms },
    callback: () => T,
  ) => {
    transform = props.transform
    position = props.transform?.position
    left = position?.x ?? 0
    top = position?.y ?? 0
    rotation = transform?.rotation ?? 0

    if (!transform) {
      return callback()
    } else if (transform.skew) {
      transferMatrix(matrix2, matrix)

      matrix.translateSelf(left, top)
      matrix.rotateSelf(rotation ?? 0)
      matrix.skewXSelf(transform.skew?.x ?? 0)
      matrix.skewYSelf(transform.skew?.y ?? 0)

      ctx.setTransform(matrix)
      result = callback()
      ctx.setTransform(matrix2)

      transferMatrix(matrix, matrix2)

      return result
    } else {
      ctx.translate(left, top)
      result = callback()
      ctx.translate(left * -1, top * -1)
      ctx.rotate(rotation * -1)
      return result
    }
  }
}

export { createTransformedCallback }
