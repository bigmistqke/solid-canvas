import { resolveTokens, TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor, createEffect, JSX, splitProps } from 'solid-js'
import {
  InternalContext,
  InternalContextType,
} from 'src/context/InternalContext'
import { ControllerEvents } from 'src/controllers/controllers'

import { CanvasToken, parser } from 'src/parser'
import {
  CanvasMouseEvent,
  Composite,
  ExtendedColor,
  Vector,
  Shape2DProps,
} from 'src/types'
import forEachReversed from 'src/utils/forEachReversed'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import withContext from 'src/utils/withContext'
import { SingleOrArray } from './typehelpers'

/**
 * Object2Ds (and clips) the component's children
 */

// export type Object2DProps = {
//   /**
//    * Defaults to { x: 0, y: 0}
//    */
//   position?: Position
//   children?: JSX.Element | JSX.Element[]
//   opacity?: number
//   fill?: ExtendedColor
//   composite?: Composite
//   clip?: Accessor<JSX.Element | JSX.Element[]>
//   draggable?: boolean | 'controlled'
//   controllers?: ((props: Object2DProps, events: ControllerEvents) => any)[]
//   onMouseDown?:
//     | ((event: CanvasMouseEvent) => void)
//     | ((event: CanvasMouseEvent) => void)[]
//   onMouseUp?:
//     | ((event: CanvasMouseEvent) => void)
//     | ((event: CanvasMouseEvent) => void)[]
//   onMouseMove?:
//     | ((event: CanvasMouseEvent) => void)
//     | ((event: CanvasMouseEvent) => void)[]
//   onMouseEnter?:
//     | ((event: CanvasMouseEvent) => void)
//     | ((event: CanvasMouseEvent) => void)[]
//   onMouseLeave?:
//     | ((event: CanvasMouseEvent) => void)
//     | ((event: CanvasMouseEvent) => void)[]
// }

function createParenthood<T>(
  props: { children?: SingleOrArray<JSX.Element> },
  context: InternalContextType,
) {
  ;[props] = splitProps(props, ['children'])

  const tokens = resolveTokens(
    parser,
    withContext(() => props.children, InternalContext, context),
  )

  const render = (ctx: CanvasRenderingContext2D) => {
    forEachReversed(tokens(), ({ data }) => {
      if ('render' in data) data.render?.(ctx)
    })
    forEachReversed(tokens(), ({ data }) => {
      if ('debug' in data && context.debug) data.debug(ctx)
    })
  }

  let hitTestResult: TokenElement<CanvasToken>[], hitTestHit: boolean
  const hitTest = (event: CanvasMouseEvent) => {
    hitTestResult = []
    hitTestHit
    tokens().forEach(token => {
      if (!event.propagation) return
      if ('hitTest' in token.data) {
        hitTestHit = token.data.hitTest(event)
        if (hitTestHit) {
          hitTestResult.push(token)
        }
      }
    })
    /*  forEachReversed(tokens(), token => {
      if (!event.propagation) return
      if ('hitTest' in token.data) {
        hitTestHit = token.data.hitTest(event)
        if (hitTestHit) {
          hitTestResult.push(token)
        }
      }
    }) */
    return hitTestHit
  }

  return { render, hitTest }
}

export { createParenthood }
