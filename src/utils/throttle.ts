let amount = 60
export const throttle = (callback: (...args: any[]) => void) => {
  let lastTime: number = performance.now()
  return (...args: any[]) => {
    if (performance.now() - lastTime < 1000 / amount) {
      lastTime = performance.now()
      queueMicrotask(() => callback(...args))
      return
    } else {
      lastTime = performance.now()
      return callback(...args)
    }
  }
}
