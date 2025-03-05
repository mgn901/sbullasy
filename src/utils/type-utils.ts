export type PickByValue<T, U> = Pick<T, { [K in keyof T]: T[K] extends U ? K : never }[keyof T]>;

export type ExcludeFromTuple<T extends readonly unknown[], U> = T extends readonly []
  ? readonly []
  : T extends readonly [infer V, ...infer W]
    ? V extends U
      ? ExcludeFromTuple<W, U>
      : readonly [V, ...ExcludeFromTuple<W, U>]
    : T;

type KnownKeyOf<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer X | never }
  ? X
  : never;

export type OmitIndexSignature<T> = KnownKeyOf<T> extends keyof T ? Pick<T, KnownKeyOf<T>> : never;

export type ArrowFunction<T> = T extends (...args: infer A) => infer R
  ? (this: unknown, ...args: A) => R
  : T;

export type Primitive = string | number | bigint | boolean | undefined | symbol | null;

export type NominalPrimitive<TPrimitive extends Primitive, N extends symbol> = TPrimitive &
  Record<N, unknown>;
