import { createToken, resolveTokens } from '@solid-primitives/jsx-tokenizer'
import { JSX, mergeProps } from 'solid-js'
import { useCanvas } from 'src'
import { CanvasContext } from 'src/context'

import { parser } from 'src/parser'
import { Position, Composite, CanvasMouseEvent } from 'src/types'
import { isPointInShape } from 'src/utils/isPointInShape'
import revEach from 'src/utils/revEach'
import withContext from 'src/utils/withContext'

/**
 * Groups (and clips) the component's children
 */

const Group = createToken(
  parser,
  (props: {
    children: JSX.Element | JSX.Element[]
    /**
     * Defaults to { x: 0, y: 0}
     */
    position?: Position
    clip?: JSX.Element | JSX.Element[]
    composite?: Composite
  }) => {
    const context = useCanvas()
    if (!context) throw 'CanvasTokens need to be included in Canvas'
    const merged = mergeProps({ position: { x: 0, y: 0 } }, props)

    const clipTokens = resolveTokens(parser, () => props.clip)

    const tokens = resolveTokens(
      parser,
      withContext(() => props.children, CanvasContext, {
        ...context,
        get origin() {
          return context
            ? {
                x: merged.position.x + context.origin.x,
                y: merged.position.y + context.origin.y,
              }
            : merged.position
        },
      }),
    )

    const render = (ctx: CanvasRenderingContext2D) => {
      if (props.clip) {
        const path = new Path2D()
        clipTokens().forEach(({ data }) => {
          if ('clip' in data) {
            path.addPath(data.path())
          }
        })
        ctx.clip(path)
      }
      if (merged.composite) {
        // TODO:  to accurately composite `Group` we should render the contents of `Group`
        //        to an OffscreenCanvas and then draw the result with the globalCompositeOperation
        ctx.globalCompositeOperation = merged.composite
      }
      revEach(tokens(), ({ data }) => {
        context?.ctx.save()
        if ('render' in data) data.render(ctx)
        context?.ctx.restore()
        if ('debug' in data && context.debug) data.debug(ctx)
        context?.ctx.restore()
      })
    }

    const hitTestClip = (event: CanvasMouseEvent) => {
      const path = new Path2D()
      clipTokens().forEach(({ data }) => {
        if ('path' in data) {
          path.addPath(data.path())
        }
      })
      return isPointInShape(event, context.ctx, merged, path)
    }

    const hitTest = (event: CanvasMouseEvent) => {
      if (clipTokens().length > 0) {
        if (!hitTestClip(event)) return false
      }
      let result = false
      tokens().forEach(({ data }) => {
        if ('hitTest' in data) {
          const hit = data.hitTest(event)

          if (hit) result = true
        }
      })
      /* revEach(tokens(), ({ data }) => {
      }) */
      return result
    }

    return {
      type: 'Group',
      debug: () => {},
      hitTest,
      render,
    }
  },
)

export { Group }
