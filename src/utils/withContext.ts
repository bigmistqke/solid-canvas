import { Accessor, Context, JSX, untrack } from 'solid-js'

export default function withContext<T>(
  children: Accessor<JSX.Element | JSX.Element[]>,
  context: Context<T>,
  value: T,
) {
  let result: JSX.Element | JSX.Element[]
  context.Provider({
    value: untrack(() => value),
    children: () => {
      result = children()
      return ''
    },
  })
  return () => result
}
