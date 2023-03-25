import { createToken, TokenComponent } from '@solid-primitives/jsx-tokenizer'
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  Show,
  splitProps,
} from 'solid-js'
import { Rectangle } from 'src'

import { useInternalContext } from 'src/context/InternalContext'
import { CanvasToken, parser } from 'src/parser'
import { Dimensions, ExtendedColor, Normalize, Shape2DProps } from 'src/types'
import { defaultShape2DProps } from 'src/defaultProps'
import filterShape2DProps from 'src/utils/filterShape2DProps'
import { resolveExtendedColor } from 'src/utils/resolveColor'
import { GroupProps } from '../Group'
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

  const render = (ctx: CanvasRenderingContext2D) => {
    const offset = canvas?.origin ?? { x: 0, y: 0 }
    ctx.font = getFontString(props.size, props.fontFamily)

    if (props.opacity) ctx.globalAlpha = props.opacity
    ctx.fillStyle = resolveExtendedColor(merged.fill) ?? 'black'
    ctx.strokeStyle = resolveExtendedColor(merged.stroke) ?? 'transparent'

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
  }

  return {
    props: filteredProps,
    type: 'StaticShape2D',
    id: 'Text',
    render,
  }
})

function withRectangle<T extends TextProps, U extends unknown>(
  Component: TokenComponent<T, U>,
) {
  return (
    props: Omit<T, 'dimensions'> &
      Omit<RectangleProps, 'dimensions'> &
      GroupProps & {
        hover?: Omit<RectangleProps, 'dimensions'> & {
          background: ExtendedColor
        }
      },
  ) => {
    const [hover, setHover] = createSignal(false)
    const canvas = useInternalContext()

    const [rectangleProps, textProps] = splitProps(props, [
      'rounded',
      'position',
      'clip',
      'onMouseDown',
      'onMouseMove',
      'onMouseUp',
    ])

    const mergedRectangleProps = mergeProps(
      { stroke: 'transparent' },
      rectangleProps,
    )

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

    const textPropsWithHover = createMemo(() =>
      hover() ? { ...textProps, ...textProps.hover } : textProps,
    )

    return (
      <Show when={dimensions()}>
        <Rectangle
          {...mergedRectangleProps}
          position={rectangleProps.position}
          lineWidth={textProps.padding}
          fill={textPropsWithHover().background}
          stroke={textPropsWithHover().background}
          dimensions={dimensions()!}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          composite={props.composite}
        >
          {props.children}
          <Component
            {...(textPropsWithHover() as T)}
            composite={props.composite}
            dimensions={dimensions()!}
          />
        </Rectangle>
      </Show>
    )
  }
}

const TextWithRectangle = withRectangle(Text)
export { TextWithRectangle as Text }
