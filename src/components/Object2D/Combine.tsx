import { mergeProps } from 'solid-js'
import { defaultShape2DProps } from 'src/defaultProps'
import { ResolvedShape2DProps, Shape2DProps } from 'src/types'
import forEachReversed from 'src/utils/forEachReversed'
import renderPath from 'src/utils/renderPath'
import { createObject2D } from './createObject2D'

const Combine = createObject2D<Shape2DProps>({
  id: 'Combine',
  render: (canvas, props, tokens) => {
    const merged = mergeProps(
      {
        ...defaultShape2DProps,
      },
      props,
    )
    const path = new Path2D()
    forEachReversed(tokens, ({ data }) => {
      if ('path' in data) path.addPath(data.path())
      else if ('paths' in data) {
        data.paths().forEach(p => path.addPath(p))
      }
    })
    // renderPath(path)
    renderPath(
      canvas.ctx,
      merged,
      path,
      canvas?.origin,
      (canvas?.selected && canvas?.selected === this) ||
        (canvas?.hovered && canvas?.hovered === this),
    )
  },
})

export { Combine }
