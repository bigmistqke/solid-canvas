import { Accessor, Context, JSX, untrack } from 'solid-js'
import { SingleOrArray } from './typehelpers'

type CheckSingle<Arg> = Arg extends {
  context: infer TContext
  value: infer TValue
}
  ? TContext extends Context<TValue | undefined>
    ? true
    : false
  : false

type CheckContexts<Array> = Array extends (infer Arg)[]
  ? CheckSingle<Arg> extends true
    ? Array
    : false
  : false

const nestContexts = (contexts: any, index: number, callback: () => void) => {
  const { context, value } = contexts[index]!
  context.Provider({
    value: untrack(() => value),
    children: () => {
      if (index < contexts.length - 1) {
        nestContexts(contexts, index + 1, callback)
      } else {
        callback()
      }
      return ''
    },
  })
}

function withContext<T extends [...any[]], U>(
  children: Accessor<U>,
  contexts: CheckContexts<T>,
): Accessor<U>
function withContext<T extends any, U>(
  children: Accessor<U>,
  context: Context<T>,
  value: T,
): Accessor<U>
function withContext<T extends [...any[]], U>(
  children: Accessor<U>,
  ContextOrContexts: Context<T> | CheckContexts<T>,
  value?: T,
) {
  let result: U

  if (Array.isArray(ContextOrContexts)) {
    nestContexts(ContextOrContexts, 0, () => (result = children()))
  } else if (typeof ContextOrContexts === 'object' && value) {
    ContextOrContexts.Provider({
      value: untrack(() => value),
      children: () => {
        result = children()
        return ''
      },
    })
    /* const provider = (
      <ContextOrContexts.Provider value={untrack(() => value)}>
        {() => children}
      </ContextOrContexts.Provider>
    ) */
  }

  return () => result
}
export default withContext
