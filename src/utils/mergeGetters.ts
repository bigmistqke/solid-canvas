function mergeGetters<A, B>(a: A, b: B) {
  const result = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(a),
      ...Object.getOwnPropertyDescriptors(b),
    },
  )
  return result as A & B
}
export { mergeGetters }
