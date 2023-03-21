import { TokenComponent } from '@solid-primitives/jsx-tokenizer'
import { splitProps } from 'solid-js'
import { Group, GroupProps } from 'src/components/Group'
import { ShapeProps } from 'src/types'

function withGroup<T extends ShapeProps, U extends unknown>(Component: TokenComponent<T, U>) {
  return (props: T & GroupProps) => {
    const [groupProps, shapeProps] = splitProps(props, [
      'children',
      'clip',
      'composite',
      'position',
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
