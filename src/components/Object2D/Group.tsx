import { createToken } from '@solid-primitives/jsx-tokenizer'
import { Accessor, mergeProps, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { useInternalContext } from 'src/context/InternalContext'
import { RegisterControllerEvents } from 'src/controllers/controllers'
import { CanvasToken, parser } from 'src/parser'
import { Color, Object2DProps, ResolvedShape2DProps, Vector } from 'src/types'
import { createParenthood } from 'src/utils/createParenthood'
import { transformedCallback } from 'src/utils/transformedCallback'
import { SingleOrArray } from 'src/utils/typehelpers'
import { T } from 'vitest/dist/types-c800444e'

export type GroupProps = {
  children: SingleOrArray<JSX.Element>
  fill?: Color
  clip?: Accessor<SingleOrArray<JSX.Element>>
  position?: Vector
  controllers?: ((
    props: Accessor<ResolvedShape2DProps<any>>,
    events: RegisterControllerEvents,
  ) => Accessor<ResolvedShape2DProps<any>>)[]
}

/**
 * Group multiple `Shapes` together
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect)
 */
const Group = createToken(parser, (props: Object2DProps) => {
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
  const context = useInternalContext()
  const parenthood = createParenthood(props, context!)
  return {
    type: 'Object2D',
    id: 'Group',
    render: ctx => {
      ctx.translate(
        props.transform?.position?.x ?? 0,
        props.transform?.position?.y ?? 0,
      )
      ctx.rotate(props.transform?.rotation ?? 0)
      parenthood.render(ctx)
      ctx.translate(
        (props.transform?.position?.x ?? 0) * -1,
        (props.transform?.position?.y ?? 0) * -1,
      )
      ctx.rotate((props.transform?.rotation ?? 0) * -1)
    },
    debug: () => {},
    hitTest: event => {
      if (!event.propagation) return

      return transformedCallback(event.ctx, props, () => {
        const hit = parenthood.hitTest(event)
        if (hit) {
          props[event.type]?.(event)
        }
        return hit
      })
    },
    paths: () => [],
    tokens: [],
  } as CanvasToken
})

export { Group }
