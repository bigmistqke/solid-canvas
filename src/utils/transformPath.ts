import { Accessor } from 'solid-js'

export default (path: Accessor<Path2D>, matrix: Accessor<DOMMatrix>) => {
  return () => {
    const transformed = new Path2D()
    transformed.addPath(path(), matrix())
    return transformed
  }
}
