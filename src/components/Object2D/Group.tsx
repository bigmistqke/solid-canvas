import { createToken } from '@solid-primitives/jsx-tokenizer'
import { Accessor, mergeProps, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { RegisterControllerEvents } from 'src/controllers/controllers'
import { CanvasToken, parser } from 'src/parser'
import { Color, ResolvedShape2DProps, Vector } from 'src/types'
import { createParenthood } from 'src/utils/createParenthood'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { SingleOrArray } from 'src/utils/typehelpers'
import { T } from 'vitest/dist/types-c800444e'

export type GroupProps = {
  children: SingleOrArray<JSX.Element>
  fill?: Color
  clip?: Accessor<SingleOrArray<JSX.Element>>
  position?: Vector
  controllers?: ((
    props: Accessor<ResolvedShape2DProps>,
    events: RegisterControllerEvents,
  ) => Accessor<ResolvedShape2DProps>)[]
}

/**
 * Group multiple `Shapes` together
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Group = createToken(parser, (props: GroupProps) => {
  const [, propsWithoutChildren] = splitProps(props, ['children'])
  const mergedProps = mergeProps(
    { position: { x: 0, y: 0 }, fill: undefined },
    propsWithoutChildren,
  )

  // NOTE:  we will have to figure out a way to make controllers typesafe
  //        so each controller knows what sort of props to expect
  //        and you don't use the wrong controllers
  //        until then we will only allow controllers for types extending `Shape2DProps`

  // const controlled = createControlledProps(mergedProps)
  const context = createUpdatedContext(() => mergedProps)
  const parenthood = createParenthood(props, context)
  return {
    type: 'Object2D',
    id: 'Group',
    render: ctx => parenthood.render(ctx),
    debug: () => {},
    hitTest: event => {
      parenthood.hitTest(event)
      if (!event.propagation) return false
      return true
    },
    paths: () => [],
    tokens: [],
  } as CanvasToken
})

export { Group }
