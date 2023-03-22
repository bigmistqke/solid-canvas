import { createSignal, onCleanup } from 'solid-js'

const useClock = () => {
  const [clock, setClock] = createSignal(0)
  let last = performance.now()
  const tick = () => {
    setClock(c => c + 1)
    last = performance.now()
  }
  let interval: NodeJS.Timer
  return {
    clock,
    start: (fps?: number) => {
      if (fps) {
        if (interval) clearInterval(interval)
        interval = setInterval(tick, fps)
        onCleanup(() => clearInterval(interval))
      } else {
        const loop = () => {
          requestAnimationFrame(loop)
          tick()
        }
        loop()
      }
    },
    stop: () => {
      if (interval) clearInterval(interval)
    },
    tick,
  }
}

export { useClock }
