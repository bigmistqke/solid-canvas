export type RequiredPartially<T, U extends keyof T> = RequireOptionals<
  Pick<T, U>
> &
  Omit<T, U>

export type Normalize<T> = T extends (...args: infer A) => infer R
  ? (...args: Normalize<A>) => Normalize<R>
  : { [K in keyof T]: T[K] }

export type SingleOrArray<T> = T | T[]

// from https://stackoverflow.com/a/74788555/4366929
type FilteredKeys<T> = {
  [K in keyof T]: T[K] extends never ? never : K
}[keyof T]

type RemoveNever<T> = {
  [K in FilteredKeys<T>]: T[K]
}

/**
 * returns a type with all optional keys required and all non-optional keys as `never`
 */
export type RequireOptionals<T extends object> = RemoveNever<{
  [K in keyof T]: T extends Record<K, T[K]> ? never : T[K]
}>

export type DeepRequired<T> = {
  [K in keyof T]: Required<DeepRequired<T[K]>>
}
