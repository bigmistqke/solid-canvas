import { createEffect } from 'solid-js'
import { useInternalContext } from 'src/context/InternalContext'
import { defaultBoundsProps } from 'src/defaultProps'
import { Shape2DToken } from 'src/parser'
import { Shape2DProps, Vector } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import hitTest from 'src/utils/hitTest'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import renderPath from 'src/utils/renderPath'
import { createUpdatedContext } from './createUpdatedContext'
import { mergeGetters } from './mergeGetters'

const createPath2D = <T extends unknown>(arg: {
  id: string
  props: Shape2DProps<T>
  defaultProps: Partial<Shape2DProps<T> & T>
  path: (props: Required<Shape2DProps<T> & T>) => Path2D
  bounds: (props: Required<Shape2DProps<T> & T>) => Vector[]
}) => {
  const controlled = createControlledProps(
    // TODO: fix ts-ignore
    // @ts-ignore
    mergeShape2DProps(arg.props, arg.defaultProps),
  )

  const internalContext = useInternalContext()
  const matrix = createMatrix(
    controlled.props,
    () => internalContext?.matrixValues,
  )

  const context = mergeGetters(internalContext, {
    get matrixValues() {
      return {
        a: matrix().a,
        b: matrix().b,
        c: matrix().c,
        d: matrix().d,
        e: matrix().e,
        f: matrix().f,
      }
    },
  })

  const parenthood = createParenthood(arg.props, context)

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
        context.ctx,
        controlled.props,
        transformedPath(),
        context.isHovered(token) || context.isSelected(token),
      )
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
    debug: ctx => {
      renderPath(ctx, defaultBoundsProps, bounds().path, false)
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
