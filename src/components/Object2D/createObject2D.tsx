import {
  createToken,
  resolveTokens,
  TokenElement,
} from '@solid-primitives/jsx-tokenizer'
import { Accessor, JSX, mergeProps } from 'solid-js'
import {
  InternalContext,
  InternalContextType,
  useInternalContext,
} from 'src/context/InternalContext'

import { CanvasToken, parser } from 'src/parser'
import { CanvasMouseEvent, Composite, ExtendedColor, Position } from 'src/types'
import { isPointInShape2D } from 'src/utils/isPointInShape2D'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import forEachReversed from 'src/utils/forEachReversed'
import withContext from 'src/utils/withContext'
import useDraggable from 'src/utils/useDraggable'

/**
 * Object2Ds (and clips) the component's children
 */

export type Object2DProps = {
  /**
   * Defaults to { x: 0, y: 0}
   */
  position?: Position
  children?: JSX.Element | JSX.Element[]
  opacity?: number
  fill?: ExtendedColor
  composite?: Composite
  clip?: Accessor<JSX.Element | JSX.Element[]>
  draggable?: boolean | 'controlled'
  onDragMove?: (position: Position, event: CanvasMouseEvent) => void
}

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
    const merged = mergeProps({ position: { x: 0, y: 0 } }, props) as T &
      Object2DProps

    const [dragPosition, dragEventHandler] = useDraggable(props)

    const offset = () =>
      props.draggable === 'controlled' ? { x: 0, y: 0 } : dragPosition()

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
              x: merged.position.x + canvas.origin.x + offset().x,
              y: merged.position.y + canvas.origin.y + offset().y,
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
      options.render(canvas, merged, tokens())

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
      let stop = false
      // const stopPropagation = () => (stop = true)
      forEachReversed(tokens(), token => {
        if (!event.propagation) return
        if ('hitTest' in token.data) {
          const hit = token.data.hitTest(event)
          if (hit) {
            result.push(token)
            event.propagation = false
          }
        }
      })
      if (
        result.length === 1 &&
        result[0] === tokens()[tokens().length - 1] &&
        props.draggable
      ) {
        dragEventHandler(event)
      }
      return false
    }

    return {
      type: 'Object2D',
      id: options.id,
      debug: () => {},
      hitTest,
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
