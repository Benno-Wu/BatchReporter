export type unknownFunction = (...args: unknown[]) => unknown
export type unknownAsyncFunction = (...args: unknown[]) => Promise<unknown>
export type booleanAsyncFunction = () => Promise<boolean>
export type AsyncDataHandler<T> = (data: T[]) => Promise<boolean>
export type DataHandler<T, R = boolean> = (data: T[]) => R
export type DataLoader<T> = (data: string) => T

export type PickByNullableKeys<T> = Required<Pick<T, { [k in keyof T]: undefined extends T[k] ? k : never }[keyof T]>>
