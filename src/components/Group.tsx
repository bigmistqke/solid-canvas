import { createToken, resolveTokens, TokenElement } from '@solid-primitives/jsx-tokenizer'
import { Accessor, JSX, createMemo, mergeProps } from 'solid-js'
import { Position, useCanvas } from 'src'
import { CanvasContext } from 'src/context'

import { CanvasMouseEvent, CanvasToken, parser } from 'src/parser'
import withContext from 'src/utils/withContext'

const Group = createToken(
  parser,
  (props: {
    children: JSX.Element | JSX.Element[]
    position?: Position
    clip?: JSX.Element | JSX.Element[]
  }) => {
    const context = useCanvas()
    const merged = mergeProps({ position: { x: 0, y: 0 } }, props)

    const clipTokens = resolveTokens(parser, () => props.clip)

    const tokens = resolveTokens(
      parser,
      withContext(() => props.children, CanvasContext, {
        ctx: context!.ctx,
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

    const reversedTokens = createMemo(() => {
      const t = tokens()
      return Array.isArray(t) ? t.reverse() : t
    })

    const render = (ctx: CanvasRenderingContext2D) => {
      if (props.clip) {
        clipTokens().forEach(({ data }) => {
          if ('clip' in data) {
            data.clip(ctx)
          }
        })
        // ctx.clip()
      }
      reversedTokens().forEach(({ data }) => {
        if ('render' in data) {
          data.render(ctx)
        }
      })
    }
    const hitTest = (event: CanvasMouseEvent) => {
      let result = false
      reversedTokens().forEach(({ data }) => {
        if ('hitTest' in data) {
          const hit = data.hitTest(event)
          if (hit) result = true
        }
      })
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
