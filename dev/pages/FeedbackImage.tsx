import { Component, createMemo, createSignal, on, Show } from 'solid-js'
import { Arc, Canvas, Image, createClock, Text } from 'src'
import { Composite } from 'src/types'

const randomColor = (alpha?: number) => ({
  h: Math.random() * 360,
  s: 50,
  l: 50,
  a: alpha ?? 0.5,
})

const fxs: {
  filter?: string
  alpha: number
  composite?: Composite
  offset?: { x: number; y: number } | (() => { x: number; y: number })
  double?: boolean
}[] = [
  {
    alpha: 0.2,
    composite: 'source-over',
  },
  {
    filter: `hue-rotate(10deg) brightness(101%) blur(0.1px)`,
    alpha: 0.5,
    composite: 'source-over',
    offset: {
      x: -5,
      y: 0,
    },
  },
  {
    alpha: 0.1,
    offset: {
      x: 0,
      y: -5,
    },
    composite: 'lighten',
  },
  {
    alpha: 0.75,
    offset: () => ({
      x: -1 * Math.sin(performance.now() / 5000),
      y: -1 * Math.cos(performance.now() / 5000),
    }),
    composite: 'source-over',
    double: true,
  },
]

const App: Component = () => {
  const [switchScene, setSwitchScene] = createSignal(0)
  const [cursor, setCursor] = createSignal<{ x: number; y: number }>()
  const fill = randomColor(1)

  const clock = createClock()
  clock.start()

  const switchColor = createMemo(() => Math.floor(clock.clock() / 200))

  const incrementSwitchScene = () => setSwitchScene(c => c + 1)

  window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault()
      incrementSwitchScene()
    }
  })

  const feedback = (ctx: CanvasRenderingContext2D) => {
    const bitmap = createImageBitmap(ctx.canvas)
    bitmap.then(bitmap => {
      const fx = fxs[switchScene() % fxs.length]
      ctx.restore()
      ctx.save()
      ctx.resetTransform()
      ctx.globalAlpha = 0.5
      ctx.globalAlpha = fx?.alpha ?? 1
      if (fx?.composite) ctx.globalCompositeOperation = fx?.composite
      if (fx?.filter) ctx.filter = fx.filter

      const offset =
        typeof fx?.offset === 'function' ? fx?.offset() : fx?.offset
      ctx.drawImage(
        bitmap,
        offset?.x ?? 0,
        offset?.y ?? 0,
        ctx.canvas.width,
        ctx.canvas.height,
      )
      if (fx?.double) {
        ctx.globalAlpha = 0.25
        ctx.drawImage(
          bitmap,
          (offset?.x ?? 0) * 5,
          (offset?.y ?? 0) * 5,
          ctx.canvas.width,
          ctx.canvas.height,
        )
      }
      ctx.restore()
      bitmap.close()
    })
  }

  const image = createMemo(
    () =>
      [
        'https://thumbs.dreamstime.com/b/rainbow-sky-14537169.jpg',
        'https://thumbs.dreamstime.com/b/rainbow-blue-sky-21447453.jpg',
        'https://www.ageuk.org.uk/bp-assets/globalassets/east-grinstead--district/images/home-page/rainbow.png',
      ][switchScene() % 3],
  )

  const position = createMemo(
    on(switchColor, () => ({
      x: (Math.random() * window.innerWidth) / 2,
      y: (Math.random() * window.innerHeight) / 2,
    })),
  )
  return (
    <>
      <Canvas
        fill={fill}
        clock={clock.clock()}
        style={{ width: '100%', height: '100%' }}
        feedback={feedback}
        cursor="none"
        onMouseMove={event => setCursor(event.position)}
        onMouseDown={event => incrementSwitchScene()}
        stats
      >
        <Text
          text="link"
          style={{
            background: 'white',
            fontSize: 15,
            fill: { r: 0, g: 0, b: 250 },
          }}
          transform={{
            position: { x: position().x, y: position().y },
          }}
          onMouseDown={() =>
            window.open(
              [
                'https://thumbs.dreamstime.com/b/rainbow-sky-14537169.jpg',
                'https://thumbs.dreamstime.com/b/rainbow-blue-sky-21447453.jpg',
                'https://www.ageuk.org.uk/bp-assets/globalassets/east-grinstead--district/images/home-page/rainbow.png',
              ][switchScene() % 3]!,
            )
          }
        />
        <Show when={cursor()}>
          <Image
            transform={{
              position: { x: cursor()!.x - 50, y: cursor()!.y - 50 },
            }}
            style={{
              dimensions: { width: 100, height: 100 },
              pointerEvents: false,
            }}
            image={image()!}
            clip={() => <Arc style={{ radius: 50 }} />}
          />
        </Show>
        <Image
          transform={{
            position: position(),
          }}
          style={{
            pointerEvents: false,
            dimensions: { width: 500, height: 300 },
          }}
          image={image()!}
        />
      </Canvas>
    </>
  )
}

export default App
