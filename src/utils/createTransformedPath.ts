import { Accessor, createMemo } from 'solid-js'

const createTransformedPath = (
  path: Accessor<Path2D>,
  matrix: Accessor<DOMMatrix>,
) => {
  let transformed: Path2D
  return createMemo(() => {
    transformed = new Path2D()
    transformed.addPath(path(), matrix())
    return transformed
  })
}

export { createTransformedPath }
