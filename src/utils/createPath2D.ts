import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
} from 'solid-js'
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
import { useInternalContext } from 'src/context/InternalContext'
import { transformedCallback } from './transformedCallback'

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
    Hover({
      style: props.style?.['&:hover'],
      transform: props.transform?.['&:hover'],
    }),
  ])

  const context = useInternalContext()

  const parenthood = createParenthood(arg.props, context!)

  const path = createMemo(() => arg.path(controlled.props))

  // const bounds = createBounds(() => arg.bounds(props), context)

  const [hover, setHover] = createSignal(false)

  const token: Shape2DToken = {
    type: 'Shape2D',
    id: arg.id,
    path,
    render: ctx => {
      transformedCallback(ctx, controlled.props, () => {
        renderPath(context!, controlled.props, path())
        parenthood.render(ctx)
        controlled.emit.onRender(ctx)
      })
    },
    debug: ctx => {
      // renderPath(context, defaultBoundsProps, bounds().path)
    },
    hitTest: event => {
      if (!event.propagation) return false

      return transformedCallback(event.ctx, controlled.props, () => {
        parenthood.hitTest(event)

        let hit = false
        if (controlled.props.style.pointerEvents) {
          controlled.emit.onHitTest(event)
          event.ctx.lineWidth = controlled.props.style.lineWidth
            ? controlled.props.style.lineWidth < 20
              ? 20
              : controlled.props.style.lineWidth
            : 20

          hit = isPointInShape2D(event, props, path())

          if (hit) {
            event.propagation = false
            event.target.push(token)

            controlled.props[event.type]?.(event)

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
        }
        return hit
      })

      // NOTE:  we could prevent having to transform ctx
      //        if props.children.length === 0 && !style.pointerEvents;
    },
  }

  createEffect(() =>
    context?.registerInteractiveToken(
      token,
      controlled.props.style.pointerEvents,
    ),
  )

  return token
}

export { createPath2D }
