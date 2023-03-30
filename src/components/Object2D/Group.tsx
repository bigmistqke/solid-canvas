import { createToken } from '@solid-primitives/jsx-tokenizer'
import { splitProps, mergeProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { defaultShape2DProps } from 'src/defaultProps'
import { CanvasToken, parser } from 'src/parser'
import { Color, Position } from 'src/types'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createParenthood } from 'src/utils/createParenthood'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { mergeShape2DProps } from 'src/utils/mergeShape2DProps'
import { SingleOrArray } from 'src/utils/typehelpers'

export type GroupProps = {
  children: SingleOrArray<JSX.Element>
  fill?: Color
  clip?: SingleOrArray<JSX.Element>
  position?: Position
}

/**
 * Group multiple `Shapes` together
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Group = createToken(parser, (props: GroupProps) => {
  const [, propsWithoutChildren] = splitProps(props, ['children'])
  const mergedProps = mergeProps(
    { position: { x: 0, y: 0 } },
    propsWithoutChildren,
  )
  const controlled = createControlledProps(mergedProps)
  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(props, context)
  return {
    type: 'Object2D',
    id: 'Group',
    render: ctx => parenthood.render(ctx),
    debug: () => {},
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      return true
    },
    paths: () => [],
    tokens: [],
  } as CanvasToken
})

export { Group }
