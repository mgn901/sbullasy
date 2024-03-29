import './typesafe-global';

export type TFilter<T extends object, U extends T> = {
  readonly [K in keyof T]?: U[K];
} & {
  readonly [K in keyof T as T[K] extends U[K] ? never : K]: U[K];
};

export const extract =
  <T extends object, U extends T>(filter: TFilter<T, U>): ((value: T) => value is Extract<T, U>) =>
  (value: T): value is Extract<T, U> =>
    Object.entries(filter).every(([key, operand]) => value[key] === operand);

export const exclude =
  <T extends object, U extends T>(filter: TFilter<T, U>): ((value: T) => value is Exclude<T, U>) =>
  (value: T): value is Exclude<T, U> =>
    Object.entries(filter).every(([key, operand]) => value[key] !== operand);
