import { InternalContextType } from 'src/context/InternalContext'
import { defaultBoundsProps } from 'src/defaultProps'
import { Shape2DToken } from 'src/parser'
import { Position, Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import renderPath from 'src/utils/renderPath'

const createPath2D = <T extends unknown>(arg: {
  id: string
  props: Shape2DProps<T> & T
  defaultProps: Partial<Shape2DProps<T> & T>
  path: (props: Required<Shape2DProps<T> & T>) => Path2D
  bounds: (props: Required<Shape2DProps<T> & T>) => Position[]
}) => {
  const controlled = createControlledProps(
    // TODO: fix ts-ignore
    // @ts-ignore
    mergeShape2DProps(arg.props, arg.defaultProps),
  )

  // TODO: fix typecast to any
  const context = createUpdatedContext(() => controlled.props as any)
  const parenthood = createParenthood(arg.props, context)

  const matrix = createMatrix(controlled.props)
  const transformedPath = createTransformedPath(
    () => arg.path(controlled.props as any),
    matrix,
  )
  const bounds = createBounds(
    // TODO: fix typecast to any
    () => arg.bounds(controlled.props as any),
    matrix,
  )

  const token: Shape2DToken = {
    type: 'Shape2D',
    id: arg.id,
    path: transformedPath,
    render: ctx => {
      renderPath(
        ctx,
        controlled.props,
        transformedPath(),
        context.origin,
        context.isHovered(token) || context.isSelected(token),
      )
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
    debug: ctx => {
      renderPath(ctx, defaultBoundsProps, bounds().path, context.origin, false)
    },
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      // TODO: fix typecast to any
      const hit = hitTest(token, event, context, controlled.props)
      if (hit) {
        controlled.emit[event.type](event)
      }
      return hit
    },
  }
  return token
}

export { createPath2D }
