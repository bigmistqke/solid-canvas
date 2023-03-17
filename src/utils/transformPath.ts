import { Accessor, createMemo } from 'solid-js'
import { useCanvas } from 'src'
import { ShapeProps, Position } from 'src/types'

export default (
  props: ShapeProps,
  // NOTE: has to be an accessor else it will not trigger an update
  dragPosition: Accessor<Position>,
  path: Accessor<Path2D>,
) => {
  const context = useCanvas()

  const memo = createMemo(path)
  return createMemo(() => {
    const untransformed = memo()

    const position = {
      x: (props.position?.x ?? 0) + dragPosition().x + (context?.origin.x ?? 0),
      y: (props.position?.y ?? 0) + dragPosition().y + (context?.origin.y ?? 0),
    }

    // NOTE:  since we use `matrix.translateSelf` to also handle the translation
    //        we can not short-circuit anymore
    // if (!props.rotation && !props.skewX && !props.skewY) return untransformed

    const transformed = new Path2D()
    const matrix = new DOMMatrix()

    matrix.rotateSelf(props.rotation)

    matrix.skewXSelf(props.skewX)
    matrix.skewYSelf(props.skewY)

    // NOTE:  these lines are necessary because skewing causes horizontal/vertical offset
    const point = new DOMPoint(position.x, position.y)
    const offset = point.matrixTransform(matrix)
    matrix.translateSelf(position.x + point.x - offset.x, position.y + point.y - offset.y)

    transformed.addPath(untransformed, matrix)

    return transformed
  })
}
