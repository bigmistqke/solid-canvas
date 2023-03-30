import { createToken } from '@solid-primitives/jsx-tokenizer'
import { JSX } from 'solid-js/jsx-runtime'
import { CanvasToken, parser } from 'src/parser'
import { Color } from 'src/types'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createParenthood } from 'src/utils/createParenthood'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { mergeShape2DProps } from 'src/utils/resolveShape2DProps'
import { SingleOrArray } from 'src/utils/typehelpers'

export type GroupProps = {
  children: SingleOrArray<JSX.Element>
  fill: Color
  clip: SingleOrArray<JSX.Element>
}

/**
 * Paints a rectangle to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Group = createToken(parser, (props: GroupProps) => {
  const controlled = createControlledProps(mergeShape2DProps(props, {}))
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
