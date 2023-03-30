import {
  createToken,
  TokenComponent,
  TokenElement,
} from '@solid-primitives/jsx-tokenizer'
import {
  Accessor,
  createEffect,
  createSignal,
  Show,
  splitProps,
} from 'solid-js'
import { Rectangle } from 'src'

import { Object2DToken, parser, StaticShape2D } from 'src/parser'
import {
  Dimensions,
  ExtendedColor,
  Object2DProps,
  Shape2DProps,
} from 'src/types'
import { createParenthood } from 'src/utils/createParenthood'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import { resolveShape2DProps } from 'src/utils/resolveShape2DProps'
import { Normalize } from 'src/utils/typehelpers'
import { RectangleProps } from './Path2D/Rectangle'

type Rounded =
  | number
  | [all: number]
  | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
  | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]

type TextProps = Normalize<
  Shape2DProps & {
    text: string
    size?: number
    fontFamily?: string
    background?: ExtendedColor
    dimensions: Dimensions
    padding?: number
    /**
     * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
     */
    rounded?: Rounded
    isHovered?: boolean
    isSelected?: boolean
  }
>

const getFontString = (size?: number, fontFamily?: string) =>
  `${size ?? 10}pt ${fontFamily ?? 'Arial'}`

/**
 * Paints a text to the context
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

const Text = createToken(parser, (props: TextProps) => {
  const resolvedProps = resolveShape2DProps(props, {
    close: true,
    fontFamily: 'arial',
    size: 10,
    fill: 'black',
    stroke: 'transparent',
    padding: 0,
  })

  const context = createUpdatedContext(resolvedProps)
  const parenthood = createParenthood(props, context)

  // const filteredProps = filterShape2DProps(merged)

  const token: StaticShape2D = {
    props: resolvedProps,
    type: 'StaticShape2D',
    id: 'Text',
    render: (ctx: CanvasRenderingContext2D) => {
      const offset = context.origin ?? { x: 0, y: 0 }
      if (props.text) {
        ctx.font = getFontString(props.size, props.fontFamily)

        if (props.opacity) ctx.globalAlpha = props.opacity

        ctx.fillStyle = resolveExtendedColor(resolvedProps.fill) ?? 'black'
        ctx.strokeStyle =
          resolveExtendedColor(resolvedProps.stroke) ?? 'transparent'

        if ((props.isHovered || props.isSelected) && resolvedProps.hoverStyle) {
          ctx.fillStyle =
            resolveExtendedColor(resolvedProps.hoverStyle.fill) ?? ctx.fillStyle
          ctx.strokeStyle =
            resolveExtendedColor(resolvedProps.hoverStyle.stroke) ??
            ctx.strokeStyle
        }

        // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame
        if (ctx.fillStyle !== 'transparent')
          ctx.fillText(
            resolvedProps.text,
            resolvedProps.position.x + offset.x,
            resolvedProps.position.y + offset.y + props.dimensions.height,
          )
        if (ctx.strokeStyle !== 'transparent')
          ctx.strokeText(
            resolvedProps.text,
            resolvedProps.position.x + offset.x,
            resolvedProps.position.y + offset.y + props.dimensions.height,
          )
      }
      parenthood.render(ctx)
    },
  }
  return token
})

// TODO:  reformat `withRectangle` to be more hook-like instead of hoc
function withRectangle<T extends TextProps, U extends unknown>(
  Component: TokenComponent<T, U>,
) {
  return (
    props: Omit<T, 'dimensions'> &
      Omit<RectangleProps, 'dimensions'> &
      Object2DProps & {
        hoverStyle?: Omit<RectangleProps, 'dimensions'> & {
          background?: ExtendedColor
        }
        padding?: number
      },
  ) => {
    const context = createUpdatedContext(props as any)

    const [rectangleProps, otherProps] = splitProps(props, [
      'rounded',
      'position',
      'clip',
      'onMouseDown',
      'onMouseMove',
      'onMouseUp',
      'padding',
    ])

    const [dimensions, setDimensions] = createSignal<Dimensions>()

    createEffect(() => {
      // TODO:  this timeout is needed in chrome (else all metrics would be 0)
      setTimeout(() => {
        context.ctx.font = getFontString(props.size, props.fontFamily)
        const metrics = context.ctx.measureText(props.text)
        setDimensions({
          width: metrics.width,
          height: metrics.actualBoundingBoxAscent,
        })
      }, 0)
    })

    const isHovered = () => {
      const rectangle = token().data
      return rectangle ? context.isHovered(rectangle) : false
    }
    const isSelected = () => {
      const rectangle = token().data
      return rectangle ? context.isSelected(rectangle) : false
    }

    const token = (
      <Show when={dimensions()}>
        <Rectangle
          {...rectangleProps}
          position={rectangleProps.position}
          lineWidth={rectangleProps.padding}
          fill={props.background ?? 'transparent'}
          stroke={props.background ?? 'transparent'}
          // fill="grey"
          dimensions={dimensions()!}
          composite={props.composite}
        >
          {props.children}
          <Component
            {...(otherProps as any as T)}
            composite={props.composite}
            dimensions={dimensions()!}
            isHovered={isHovered()}
            isSelected={isSelected()}
          />
        </Rectangle>
      </Show>
    ) as any as Accessor<TokenElement<Object2DToken>>

    return token
  }
}

const TextWithRectangle = withRectangle(Text)
export { TextWithRectangle as Text }
