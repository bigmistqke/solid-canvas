import { Transforms } from 'src/types'

let matrix: DOMMatrix, matrix2: DOMMatrix, result: any

const transformedCallback = <T>(
  ctx: CanvasRenderingContext2D,
  props: { transform?: Transforms },
  callback: () => T,
): T => {
  if (!props.transform) {
    return callback()
  } else if (props.transform.skew) {
    matrix = ctx.getTransform()
    matrix2 = ctx.getTransform()
    matrix.translateSelf(
      props.transform.position?.x ?? 0,
      props.transform.position?.y ?? 0,
    )
    matrix.rotateSelf(props.transform.rotation ?? 0)
    matrix.skewXSelf(props.transform.skew?.x ?? 0)
    matrix.skewYSelf(props.transform.skew?.y ?? 0)
    ctx.setTransform(matrix)
    result = callback()
    ctx.setTransform(matrix2)
    return result
  } else {
    ctx.translate(
      props.transform.position?.x ?? 0,
      props.transform.position?.y ?? 0,
    )
    ctx.rotate(props.transform.rotation ?? 0)

    result = callback()

    ctx.translate(
      (props.transform.position?.x ?? 0) * -1,
      (props.transform.position?.y ?? 0) * -1,
    )
    ctx.rotate((props.transform.rotation ?? 0) * -1)
    return result
  }
}

export { transformedCallback }
