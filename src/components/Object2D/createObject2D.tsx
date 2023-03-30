// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// DEPRECATED: ONLY HERE FOR BITS AND PIECES

import {
  createToken,
  resolveTokens,
  TokenElement,
} from '@solid-primitives/jsx-tokenizer'
import { mergeProps } from 'solid-js'
import {
  InternalContext,
  InternalContextType,
  useInternalContext,
} from 'src/context/InternalContext'

import { CanvasToken, parser } from 'src/parser'
import { CanvasMouseEvent, Object2DProps } from 'src/types'
import forEachReversed from 'src/utils/forEachReversed'
import { isPointInShape2D } from 'src/utils/isPointInShape2D'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import withContext from 'src/utils/withContext'

/**
 * Object2Ds (and clips) the component's children
 */

function createObject2D<T>(options: {
  id: string
  render: (
    canvas: InternalContextType,
    props: Object2DProps & T,
    tokens: TokenElement<CanvasToken>[],
  ) => void
}) {
  return createToken(parser, (props: T & Object2DProps) => {
    const canvas = useInternalContext()
    if (!canvas) throw 'CanvasTokens need to be included in Canvas'
    const merged = mergeProps({ position: { x: 0, y: 0 } }, props)

    const context = {
      ...canvas,
      get selected() {
        return canvas?.selected
      },
      get hovered() {
        return canvas?.hovered
      },
      get origin() {
        return canvas
          ? {
              x: merged.position.x + canvas.origin.x,
              y: merged.position.y + canvas.origin.y,
            }
          : merged.position
      },
    }

    const clipTokens = resolveTokens(
      parser,
      withContext(
        () => (typeof props.clip === 'function' ? props.clip() : props.clip),
        InternalContext,
        context,
      ),
    )

    const tokens = resolveTokens(
      parser,
      withContext(() => props.children, InternalContext, context),
    )

    const render = (ctx: CanvasRenderingContext2D) => {
      if (props.clip) {
        const path = new Path2D()
        clipTokens().forEach(({ data }) => {
          if ('path' in data) {
            path.addPath(data.path())
          }
          if ('paths' in data) {
            data.paths().forEach(p => {
              path.addPath(p)
            })
          }
        })
        ctx.clip(path)
      }
      if (merged.composite) {
        // TODO:  to accurately composite `Object2D` we should render the contents of `Object2D`
        //        to an OffscreenCanvas and then draw the result with the globalCompositeOperation
        ctx.globalCompositeOperation = merged.composite
      }
      if (props.opacity) ctx.globalAlpha = props.opacity
      if (props.fill) {
        ctx.fillStyle = resolveExtendedColor(props.fill) ?? 'transparent'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }

      // TODO:  should investigate better solution then this weird typecast
      options.render(context, merged as Object2DProps & T, tokens())

      canvas?.ctx.restore()
      forEachReversed(tokens(), ({ data }) => {
        if ('debug' in data && canvas.debug) data.debug(ctx)
      })
      canvas?.ctx.restore()
    }

    const hitTestClip = (event: CanvasMouseEvent) => {
      const path = new Path2D()
      clipTokens().forEach(({ data }) => {
        if ('path' in data) {
          path.addPath(data.path())
        }
      })
      return isPointInShape2D(event, merged, path)
    }

    const hitTest = (event: CanvasMouseEvent) => {
      if (clipTokens().length > 0) {
        if (!hitTestClip(event)) return false
      }
      let result: TokenElement<CanvasToken>[] = []
      forEachReversed(tokens(), token => {
        if (!event.propagation) return
        if ('hitTest' in token.data) {
          const hit = token.data.hitTest(event)
          if (hit) {
            result.push(token)
          }
        }
      })

      const eventHandler = merged[event.type]

      if (
        event.target[0] === tokens()[tokens().length - 1]?.data &&
        eventHandler
      ) {
        if (Array.isArray(eventHandler)) {
          eventHandler.forEach(handler => handler(event))
        } else {
          eventHandler(event)
        }
      }

      if (
        (result[0] === tokens()[tokens().length - 1] || event.propagation) &&
        props.draggable
      ) {
        // dragEventHandler(event)
      }
      return false
    }

    return {
      type: 'Object2D',
      id: options.id,
      debug: () => {},
      hitTest,
      get tokens() {
        return tokens()
      },
      paths: () => {
        return tokens()
          .map(({ data }) => {
            if ('path' in data) return [data.path()]
            if ('paths' in data) return data.paths()
            return []
          })
          .flat()
      },
      render,
    } as CanvasToken
  })
}

export { createObject2D }
