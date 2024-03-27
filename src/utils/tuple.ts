export type TExcludeFromTuple<T extends readonly unknown[], U> = T extends readonly []
  ? readonly []
  : T extends readonly [infer V, ...infer W]
    ? V extends U
      ? TExcludeFromTuple<W, U>
      : readonly [V, ...TExcludeFromTuple<W, U>]
    : T;
