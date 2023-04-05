import { Accessor } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { Shape2DProps } from 'src/types'
import { createMatrix } from './createMatrix'
import { mergeGetters } from './mergeGetters'

const createUpdatedContext = (props: Accessor<Shape2DProps<any>>) => {
  const internalContext = useInternalContext()
  const matrix = createMatrix(props(), internalContext)
  return mergeGetters(internalContext, {
    get matrix() {
      return matrix()
    },
    // style: props().style,
  })
}

export { createUpdatedContext }
