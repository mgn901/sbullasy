import type { ExcludeFromTuple } from './type-utils.ts';

type Entries<T> = (keyof T extends infer U ? (U extends keyof T ? [U, T[U]] : never) : never)[];

export declare global {
  interface ObjectConstructor {
    // biome-ignore lint/complexity/noBannedTypes: follows `lib.es2017.object.d.ts`
    entries<T extends {} | ArrayLike<unknown>>(value: T): Entries<T>;
    keys<T extends object>(o: T): (keyof T)[];
  }

  interface ReadonlyArray<T> {
    filter<S extends T>(
      predicate: (value: T, index: number, array: readonly T[]) => value is Exclude<T, S>,
      thisArg?: unknown,
    ): ExcludeFromTuple<this, S>;
  }
}
