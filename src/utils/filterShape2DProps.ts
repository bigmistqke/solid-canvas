import { splitProps } from 'solid-js'

const filterShape2DProps = <T extends Record<string, any>>(props: T) =>
  splitProps(props, [
    'fill',
    'dash',
    'stroke',
    'lineWidth',
    'hoverStyle',
    'onMouseDown',
    'onMouseUp',
    'onMouseMove',
  ])[0]

export default filterShape2DProps
