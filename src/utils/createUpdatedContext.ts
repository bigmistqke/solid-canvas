import { Accessor } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { Object2DProps, Shape2DProps } from 'src/types'
import { createMatrix } from './createMatrix'
import { mergeGetters } from './mergeGetters'

const createUpdatedContext = (props: Accessor<Shape2DProps<any>>) => {
  const internalContext = useInternalContext()
  const matrix = createMatrix(props(), () => internalContext?.matrixValues)
  return mergeGetters(internalContext, {
    get matrixValues() {
      return {
        a: matrix().a,
        b: matrix().b,
        c: matrix().c,
        d: matrix().d,
        e: matrix().e,
        f: matrix().f,
      }
    },
    // style: props().style,
  })
}

export { createUpdatedContext }
