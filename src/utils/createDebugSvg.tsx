import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'

const createDebugSvg = () => {
  const [svg, setSvg] = createSignal('')
  const portal = (
    <Portal>
      <svg
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          'z-index': 1,
          stroke: 'black',
          fill: 'transparent',
        }}
        height={1000}
      >
        <path d={svg()} />
      </svg>
    </Portal>
  )
  return setSvg
}

export { createDebugSvg }
