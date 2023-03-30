import {
  InternalContextType,
  useInternalContext,
} from 'src/context/InternalContext'
import { ResolvedShape2DProps } from 'src/types'
import { mergeGetters } from './mergeGetters'

const createUpdatedContext = (props: ResolvedShape2DProps) => {
  const internalContext = useInternalContext()
  return mergeGetters(internalContext, {
    get origin() {
      return {
        x: (internalContext?.origin.x ?? 0) + props.position.x,
        y: (internalContext?.origin.y ?? 0) + props.position.y,
      }
    },
  }) as InternalContextType
}

export { createUpdatedContext }
