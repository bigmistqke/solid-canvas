import { Component, createEffect, createSignal, JSX } from 'solid-js'
import { Arc, Canvas, createClock, Group, Rectangle } from 'src'
import { Vector } from 'src/types'
import { SingleOrArray } from 'src/utils/typehelpers'

const Arm = (props: {
  position?: Vector
  rotation?: number
  length?: number
  children?: SingleOrArray<JSX.Element>
}) => {
  return (
    <Group
      position={{ x: props.position?.x ?? 0, y: (props.position?.y ?? 0) + 5 }}
      rotation={props.rotation ?? 0}
    >
      <Rectangle
        position={{ x: 0, y: -5 }}
        dimensions={{ width: props.length ?? 100, height: 10 }}
        fill="white"
      >
        <Arc position={{ x: -5, y: -5 }} fill="black" />
        <Group position={{ x: props.length ?? 100, y: 0 }}>
          {props.children}
        </Group>
      </Rectangle>
    </Group>
  )
}

const App: Component = () => {
  /* const [time, setTime] = createSignal(180)
  setInterval(() => setTime(t => t + 1), 100) */

  const clock = createClock()
  clock.start()

  // createEffect(() => console.log('time', time()))

  return (
    <>
      <Canvas style={{ width: '100%', height: '100%' }} alpha draggable>
        <Arm rotation={180 - clock.clock()} position={{ x: 400, y: 300 }}>
          <Arm rotation={180 - clock.clock()}>
            <Arm rotation={180 - clock.clock()} />
          </Arm>
        </Arm>
        <Arm rotation={clock.clock()} position={{ x: 850, y: 300 }}>
          <Arm rotation={clock.clock()}>
            <Arm rotation={clock.clock()} />
          </Arm>
        </Arm>
      </Canvas>
    </>
  )
}

export default App
