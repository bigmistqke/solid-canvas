export type RequiredPartially<T, U extends keyof T> = Required<Omit<T, U>> &
  Pick<T, U>

export type Normalize<T> = T extends (...args: infer A) => infer R
  ? (...args: Normalize<A>) => Normalize<R>
  : { [K in keyof T]: T[K] }

export type SingleOrArray<T> = T | T[]
