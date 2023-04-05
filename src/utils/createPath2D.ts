import { createMemo } from 'solid-js'
import { defaultBoundsProps, defaultShape2DProps } from 'src/defaultProps'
import { Shape2DToken } from 'src/parser'
import {
  CanvasMouseEventListener,
  ResolvedShape2DProps,
  Shape2DProps,
  Vector,
} from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createParenthood } from 'src/utils/createParenthood'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import renderPath from 'src/utils/renderPath'
import { createUpdatedContext } from './createUpdatedContext'
import { isPointInShape2D } from './isPointInShape2D'
import { mergeGetters } from './mergeGetters'
import { RequireOptionals, SingleOrArray } from './typehelpers'

const createPath2D = <T extends { [key: string]: any }>(arg: {
  id: string
  props: Shape2DProps<T> & T
  defaultProps: RequireOptionals<T>
  path: (props: Required<T> & ResolvedShape2DProps<T>) => Path2D
  bounds: (props: Required<T> & ResolvedShape2DProps<T>) => Vector[]
}) => {
  const props = mergeGetters(
    { ...defaultShape2DProps, ...arg.defaultProps },
    arg.props,
  ) as Required<T> & ResolvedShape2DProps<T>
  const controlled = createControlledProps(props)
  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(arg.props, context)
  const path = createMemo(() => arg.path(controlled.props))

  const bounds = createBounds(() => arg.bounds(controlled.props), context)

  const token: Shape2DToken = {
    type: 'Shape2D',
    id: arg.id,
    path,
    render: ctx => {
      renderPath(
        context,
        controlled.props,
        path(),
        context.isHovered(token) || context.isSelected(token),
      )
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
    debug: ctx => {
      renderPath(context, defaultBoundsProps, bounds().path, false)
    },
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      if (controlled.props.pointerEvents === false) return false

      context.ctx.save()
      context.ctx.setTransform(context.matrix)
      // NOTE:  minimal thickness of 5
      context.ctx.lineWidth =
        controlled.props.lineWidth < 20 ? 20 : controlled.props.lineWidth
      const hit = isPointInShape2D(event, controlled.props, path())
      if (hit) {
        let listeners = controlled.props[
          event.type
        ] as SingleOrArray<CanvasMouseEventListener>

        if (listeners) {
          if (Array.isArray(listeners)) listeners.forEach(l => l(event))
          else listeners(event)
        }
        event.target.push(token)
        if (controlled.props.cursor) event.cursor = controlled.props.cursor
        controlled.emit[event.type](event)
      }
      context.ctx.restore()

      return hit
    },
  }
  return token
}

export { createPath2D }
