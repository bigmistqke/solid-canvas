import { Accessor, createEffect, createMemo } from 'solid-js'
import { InternalContextType } from 'src/context/InternalContext'
import { Shape2DProps, Transforms } from 'src/types'

const createMatrix = (
  props: Accessor<{ transform?: Partial<Transforms> }>,
  context?: InternalContextType,
) => {
  let matrix = new DOMMatrix()

  return createMemo(
    () => {
      // silly, but the most performant: https://jsbench.me/6vlg41cgg8/1
      matrix.a = context?.matrix?.a ?? 1
      matrix.b = context?.matrix?.b ?? 0
      matrix.c = context?.matrix?.c ?? 0
      matrix.d = context?.matrix?.d ?? 1
      matrix.e = context?.matrix?.e ?? 0
      matrix.f = context?.matrix?.f ?? 0

      matrix.translateSelf(
        props().transform?.position?.x,
        props().transform?.position?.y,
      )
      matrix.skewXSelf(props().transform?.skew?.x)
      matrix.skewYSelf(props().transform?.skew?.y)
      matrix.rotateSelf(props().transform?.rotation)

      return matrix
    },
    matrix,
    {
      equals: false,
    },
  )
}

export { createMatrix }
