import { TokenComponent } from '@solid-primitives/jsx-tokenizer'
import { splitProps } from 'solid-js'
import { Group, GroupProps } from 'src/components/Object2D/Group'
import { Shape2DProps } from 'src/types'

function withGroup<T extends Shape2DProps, U extends unknown>(
  Component: TokenComponent<T, U>,
) {
  return (props: T & GroupProps) => {
    const [groupProps, shapeProps] = splitProps(props, [
      'children',
      'clip',
      'position',
      'draggable',
      'onDragMove',
    ])
    return (
      <Group {...groupProps}>
        {props.children}
        <Component {...(shapeProps as T)} />
      </Group>
    )
  }
}
export default withGroup
