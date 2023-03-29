import {
  createToken,
  TokenComponent,
  TokenElement,
} from '@solid-primitives/jsx-tokenizer'
import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  Show,
  splitProps,
} from 'solid-js'
import { Rectangle } from 'src'

import { useInternalContext } from 'src/context/InternalContext'
import { defaultShape2DProps } from 'src/defaultProps'
import {
  CanvasToken,
  Object2DToken,
  parser,
  Shape2DToken,
  StaticShape2D,
} from 'src/parser'
import { Dimensions, ExtendedColor, Shape2DProps } from 'src/types'
import filterShape2DProps from 'src/utils/filterShape2DProps'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import { Normalize } from 'src/utils/typehelpers'
import { Object2DProps } from '../createObject2D'
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
 * Paints a text to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

const Text = createToken(parser, (props: TextProps) => {
  const canvas = useInternalContext()
  const merged = mergeProps(
    {
      ...defaultShape2DProps,
      close: true,
      fontFamily: 'arial',
      size: 10,
      fill: 'black',
      stroke: 'transparent',
      padding: 0,
    },
    props,
  )
  const filteredProps = filterShape2DProps(merged)

  const token: StaticShape2D = {
    props: filteredProps,
    type: 'StaticShape2D',
    id: 'Text',
    render: (ctx: CanvasRenderingContext2D) => {
      const offset = canvas?.origin ?? { x: 0, y: 0 }
      ctx.font = getFontString(props.size, props.fontFamily)

      if (props.opacity) ctx.globalAlpha = props.opacity

      ctx.fillStyle = resolveExtendedColor(merged.fill) ?? 'black'
      ctx.strokeStyle = resolveExtendedColor(merged.stroke) ?? 'transparent'

      if ((props.isHovered || props.isSelected) && merged.hoverStyle) {
        ctx.fillStyle =
          resolveExtendedColor(merged.hoverStyle.fill) ?? ctx.fillStyle
        ctx.strokeStyle =
          resolveExtendedColor(merged.hoverStyle.stroke) ?? ctx.strokeStyle
      }

      // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame
      if (ctx.fillStyle !== 'transparent')
        ctx.fillText(
          merged.text,
          merged.position.x + offset.x,
          merged.position.y + offset.y + props.dimensions.height,
        )
      if (ctx.strokeStyle !== 'transparent')
        ctx.strokeText(
          merged.text,
          merged.position.x + offset.x,
          merged.position.y + offset.y + props.dimensions.height,
        )
    },
  }
  return token
})

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
    const canvas = useInternalContext()

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
      if (!canvas) return
      // TODO:  this timeout is needed in chrome (else all metrics would be 0)
      setTimeout(() => {
        canvas.ctx.font = getFontString(props.size, props.fontFamily)
        const metrics = canvas.ctx.measureText(props.text)
        setDimensions({
          width: metrics.width,
          height: metrics.actualBoundingBoxAscent,
        })
      }, 0)
    })

    const isHovered = () => {
      const rectangle =
        token().data.tokens[token().data.tokens.length - 1]?.data
      return rectangle ? canvas?.isHovered(rectangle) : false
    }
    const isSelected = () => {
      const rectangle =
        token().data.tokens[token().data.tokens.length - 1]?.data
      return rectangle ? canvas?.isSelected(rectangle) : false
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
