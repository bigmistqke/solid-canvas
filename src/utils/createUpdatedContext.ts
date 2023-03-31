import { Accessor } from 'solid-js'
import { GroupProps } from 'src/components/Object2D/Group'
import {
  InternalContextType,
  useInternalContext,
} from 'src/context/InternalContext'
import { Position, ResolvedShape2DProps } from 'src/types'
import { mergeGetters } from './mergeGetters'

const createUpdatedContext = (
  props: Accessor<
    ResolvedShape2DProps | Omit<GroupProps & { position: Position }, 'children'>
  >,
) => {
  const internalContext = useInternalContext()
  return mergeGetters(internalContext ?? {}, {
    get origin() {
      return {
        x: (internalContext?.origin.x ?? 0) + props().position.x,
        y: (internalContext?.origin.y ?? 0) + props().position.y,
      }
    },
  }) as InternalContextType
}

export { createUpdatedContext }
