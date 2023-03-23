export default <T>(arr: T[], callback: (value: T, index: number) => void) => {
  for (let index = arr.length - 1; index >= 0; index--) {
    callback(arr[index]!, index)
  }
}
