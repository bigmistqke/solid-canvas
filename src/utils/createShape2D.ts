import { TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor, createEffect, splitProps } from 'solid-js'
import { Rectangle } from 'src/components/Object2D/Shape2D/Path2D/Rectangle'
import {
  InternalContextType,
  InternalContext,
} from 'src/context/InternalContext'
import { Shape2DToken, Object2DToken } from 'src/parser'
import { Shape2DProps, Dimensions, Object2DProps } from 'src/types'
import { createControlledProps } from './createControlledProps'
import { createMatrix } from './createMatrix'
import { createParenthood } from './createParenthood'
import { createUpdatedContext } from './createUpdatedContext'
import { deepMergeGetters, mergeGetters } from './mergeGetters'
import { mergeShape2DProps } from './mergeShape2DProps'
import withContext from './withContext'

const createShape2D = <
  T,
  U extends Partial<Object2DProps & Shape2DProps & T>,
>(arg: {
  id: string
  props: Object2DProps & Shape2DProps & T
  dimensions: Dimensions
  setup: (
    props: Object2DProps & Shape2DProps & T & U,
    context: InternalContextType,
    matrix: DOMMatrix,
  ) => void
  render: (
    props: Object2DProps & Shape2DProps & T & U,
    context: InternalContextType,
    matrix: DOMMatrix,
  ) => void
  defaultValues: U
}) => {
  const controlled = createControlledProps(
    // TODO:  fix any
    deepMergeGetters(arg.defaultValues, arg.props),
  )
  const matrix = createMatrix(() => arg.props)

  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(arg.props, context)

  // TODO:  fix any
  arg.setup(controlled.props as any, context, matrix())

  const [shapeProps] = splitProps(arg.props, ['transform', 'style'])
  const rectangleProps = deepMergeGetters(shapeProps, {
    style: {
      get fill() {
        return arg.props.style?.background ?? 'black'
      },
      get stroke() {
        return arg.props.style?.background ?? 'black'
      },
      get lineWidth() {
        return arg.props.style?.padding
      },
      get dimensions() {
        return arg.dimensions
      },
    },
  })

  const path = withContext(
    () => Rectangle(rectangleProps),
    InternalContext,
    context,
  ) as Accessor<TokenElement<Shape2DToken>>

  const token: Object2DToken = {
    type: 'Object2D',
    id: arg.id,
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      let hit = path().data.hitTest(event)

      if (hit) {
        controlled.emit[event.type](event)
      }
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      return hit
    },
    debug: event => path().data.debug(event),
    render: ctx => {
      path().data.render(ctx)
      // TODO:  fix any
      arg.render(controlled.props as any, context, matrix())
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
  }
  return token
}
export { createShape2D }
