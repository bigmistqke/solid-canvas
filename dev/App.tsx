import { Component, createSignal } from 'solid-js'
import { Canvas, Gradient, Pattern, Rectangle } from '../src'

const App: Component = () => {
  const [counter, setCounter] = createSignal(0)

  setInterval(() => setCounter(c => c + 1), 100)

  const [selected, setSelected] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 200, y: 100 })

  const image = (
    <img
      width="100"
      height="100"
      style={{ height: '100px', width: '100px' }}
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1920px-Image_created_with_a_mobile_phone.png"
    />
  )

  const video = (
    <video
      controls
      muted={true}
      autoplay
      // style={{ 'z-index': 2, position: 'absolute' }}
      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
    />
  )

  return (
    <>
      {/* {video} */}
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        onMouseDown={e => {
          if (e.target.length === 0) setSelected(false)
        }}
        onMouseMove={e => {
          if (selected()) {
            setPosition(pos => ({ x: pos.x + e.delta.x, y: pos.y + e.delta.y }))
          }
        }}
      >
        <Rectangle
          onMouseDown={event => {
            setSelected(true)
          }}
          onMouseUp={event => {
            setSelected(false)
          }}
          position={position()}
          dimensions={{ width: 100, height: 100 }}
          lineWidth={20}
          stroke={
            <Gradient
              type="linear"
              start={{ x: window.innerWidth, y: 0 }}
              end={{ x: 0, y: window.innerHeight }}
              stops={[
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
              ]}
            />
          }
          fill={
            <Pattern
              image={
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
              }
              repetition="repeat"
            />
          }
          rotation={3}
          skewX={5}
        />
      </Canvas>
    </>
  )
}

export default App
