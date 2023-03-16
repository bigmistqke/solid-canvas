import { createToken, resolveTokens } from '@solid-primitives/jsx-tokenizer'
import { JSX, mergeProps } from 'solid-js'
import { Position, useCanvas } from 'src'
import { CanvasContext } from 'src/context'

import { CanvasMouseEvent, parser } from 'src/parser'
import { isPointInShape } from 'src/utils/isPointInShape'
import { resolveColor } from 'src/utils/resolveColor'
import revEach from 'src/utils/revEach'
import withContext from 'src/utils/withContext'

const Group = createToken(
  parser,
  (props: {
    children: JSX.Element | JSX.Element[]
    position?: Position
    clip?: JSX.Element | JSX.Element[]
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
      if (props.shadow) {
        ctx.shadowBlur = props.shadow.blur ?? 0
        ctx.shadowOffsetX = props.shadow.offset?.x ?? 0
        ctx.shadowOffsetY = props.shadow.offset?.y ?? 0
        ctx.shadowColor = resolveColor(props.shadow.color ?? 'black') ?? 'black'
      }
      revEach(tokens(), ({ data }) => {
        if ('render' in data) {
          data.render(ctx)
        }
      })
    }

    const hitTestClip = (event: CanvasMouseEvent) => {
      const path = new Path2D()
      clipTokens().forEach(({ data }) => {
        if ('path' in data) {
          path.addPath(data.path())
        }
      })
      return isPointInShape(event, path)
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
      hitTest,
      render,
    }
  },
)

export { Group }
