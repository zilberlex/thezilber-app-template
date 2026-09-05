export type NonEmptyArray<T> = [T, ...T[]];
export type MaybePromise<T> = T | Promise<T>;

declare const genericArguments: unique symbol;
