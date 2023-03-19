import { Accessor, createMemo } from 'solid-js'

export default (path: Accessor<Path2D>, matrix: Accessor<DOMMatrix>) => {
  return createMemo(() => {
    const transformed = new Path2D()
    transformed.addPath(path(), matrix())
    return transformed
  })
}
