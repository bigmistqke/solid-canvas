import { createToken } from '@solid-primitives/jsx-tokenizer'

import { defaultBoundsProps } from 'src/defaultProps'
import { parser, Shape2DToken } from 'src/parser'
import { createCubic } from 'src/path'
import { Position, Shape2DProps } from 'src/types'
import { createBounds } from 'src/utils/createBounds'
import { createControlledProps } from 'src/utils/createControlledProps'
import { createMatrix } from 'src/utils/createMatrix'
import { createParenthood } from 'src/utils/createParenthood'
import { createTransformedPath } from 'src/utils/createTransformedPath'
import { createUpdatedContext } from 'src/utils/createUpdatedContext'
import hitTest from 'src/utils/hitTest'
import renderPath from 'src/utils/renderPath'
import { mergeShape2DProps } from 'src/utils/resolveShape2DProps'

type BezierProps = {
  points: {
    point: Position
    control: Position
    oppositeControl?: Position
  }[]
  close?: boolean
}

/**
 * Paints a cubic bezier to the context
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo)
 */
const Bezier = createToken(parser, (props: Shape2DProps & BezierProps) => {
  const controlled = createControlledProps(
    mergeShape2DProps(props, { close: false } as Required<BezierProps>),
  )
  const context = createUpdatedContext(() => controlled.props)
  const parenthood = createParenthood(props, context)

  const matrix = createMatrix(controlled.props)
  const path = createTransformedPath(() => {
    const svgString = createCubic(controlled.props.points).string
    const path2D = new Path2D(svgString)
    if (controlled.props.close) path2D.closePath()
    return path2D
  }, matrix)

  const bounds = createBounds(() => {
    return props.points
      .map(Object.values)
      .flat()
      .filter(v => typeof v === 'object')
  }, matrix)

  const token: Shape2DToken = {
    type: 'Shape2D',
    id: 'Bezier',
    path,
    render: ctx => {
      renderPath(
        ctx,
        controlled.props,
        path(),
        context.origin,
        context.isHovered(token) || context.isSelected(token),
      )
      parenthood.render(ctx)
      controlled.emit.onRender(ctx)
    },
    debug: ctx => {
      renderPath(ctx, defaultBoundsProps, bounds().path, context.origin, false)
    },
    hitTest: event => {
      controlled.emit.onHitTest(event)
      if (!event.propagation) return false
      const hit = hitTest(token, event, context, controlled.props)
      if (hit) {
        controlled.emit[event.type](event)
      }
      return hit
    },
  }
  return token
})

export { Bezier }
