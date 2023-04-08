import { createMemo, createSignal, createUniqueId, mergeProps } from 'solid-js'
import { defaultShape2DProps } from 'src/defaultProps'
import { Shape2DToken } from 'src/parser'
import {
  CanvasMouseEventListener,
  ResolvedShape2DProps,
  Shape2DProps,
  Vector,
} from 'src/types'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createParenthood } from 'src/utils/createParenthood'
import renderPath from 'src/utils/renderPath'
import { createUpdatedContext } from './createUpdatedContext'
import { deepMergeGetters } from './mergeGetters'
import { DeepRequired, RequireOptionals, SingleOrArray } from './typehelpers'
import { Hover } from 'src/controllers/Hover'
import { isPointInShape2D } from './isPointInShape2D'

const createPath2D = <T extends { [key: string]: any; style: any }>(arg: {
  id: string
  props: Shape2DProps<T> & T
  defaultStyle: RequireOptionals<T['style']>
  path: (props: DeepRequired<T> & ResolvedShape2DProps<T>) => Path2D
  bounds: (props: DeepRequired<T> & ResolvedShape2DProps<T>) => Vector[]
}) => {
  const style = createMemo(() =>
    deepMergeGetters(
      { ...arg.defaultStyle, ...defaultShape2DProps.style },
      arg.props.style,
    ),
  )
  const props = deepMergeGetters(arg.props, {
    get style() {
      return style()
    },
  })

  const controlled = createControlledProps(props, [
    /*  Hover({
      style: props.style?.['&:hover'],
      transform: props.transform?.['&:hover'],
    }), */
  ])

  const context = createUpdatedContext(() => controlled.props)

  const parenthood = createParenthood(arg.props, context)

  const path = createMemo(() => arg.path(controlled.props))

  // const bounds = createBounds(() => arg.bounds(props), context)

  const [hover, setHover] = createSignal(false)

  const token: Shape2DToken = {
    type: 'Shape2D',
    id: arg.id,
    path,
    render: ctx => {
      renderPath(context, controlled.props, path())
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
    debug: ctx => {
      // renderPath(context, defaultBoundsProps, bounds().path)
    },
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      if (controlled.props.style.pointerEvents === false) return false

      context.ctx.save()
      context.ctx.setTransform(context.matrix)
      context.ctx.lineWidth = controlled.props.style.lineWidth
        ? controlled.props.style.lineWidth < 20
          ? 20
          : controlled.props.style.lineWidth
        : 20

      const hit = isPointInShape2D(event, props, path())

      context.ctx.resetTransform()

      if (hit) {
        event.target.push(token)
        let controlledListeners = controlled.props[
          event.type
        ] as SingleOrArray<CanvasMouseEventListener>

        if (controlledListeners) {
          if (Array.isArray(controlledListeners))
            controlledListeners.forEach(l => l(event))
          else controlledListeners(event)
        }

        /*  let propListeners = props[
          event.type
        ] as SingleOrArray<CanvasMouseEventListener>

        if (propListeners) {
          if (Array.isArray(propListeners)) propListeners.forEach(l => l(event))
          else propListeners(event)
        } */

        if (controlled.props.cursor)
          event.cursor = controlled.props.style.cursor

        if (event.type === 'onMouseMove') {
          if (event.target.length === 1) {
            if (!hover()) {
              setHover(true)
              controlled.emit.onMouseEnter(event)
            }
          } else {
            if (hover()) {
              setHover(false)
              controlled.emit.onMouseLeave(event)
            }
          }
        }

        controlled.emit[event.type](event)
      } else {
        if (hover() && event.type === 'onMouseMove') {
          setHover(false)
          controlled.emit.onMouseLeave(event)
        }
      }
      context.ctx.restore()

      return hit
    },
  }
  return token
}

export { createPath2D }
