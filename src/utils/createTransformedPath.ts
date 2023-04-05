import { Accessor, createMemo } from 'solid-js'
import { InternalContextType } from 'src/context/InternalContext'

const createTransformedPath = (
  path: Accessor<Path2D>,
  context: InternalContextType,
) => {
  let transformed: Path2D
  return createMemo(() => {
    transformed = new Path2D()
    transformed.addPath(path(), context.matrix)
    return transformed
  })
}

export { createTransformedPath }
