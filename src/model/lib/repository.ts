import type { OmitByValue, PickByValue } from '../../utils/type-utils.ts';
import type { FieldsOf } from './type-utils.ts';

const latestVersion = Symbol('repository.latestVersion');

export const repositorySymbol = {
  latestVersion: latestVersion,
} as const;

export type Filters<T> =
  | OmitByValue<
      {
        readonly [K in keyof FieldsOf<T>]?: T[K] extends boolean
          ? T[K] | undefined
          : T[K] extends number | Date
            ?
                | T[K]
                | { readonly from?: T[K] | undefined; readonly until?: T[K] | undefined }
                | undefined
            : T[K] extends string
              ?
                  | T[K]
                  | {
                      readonly from?: T[K] | undefined;
                      readonly until?: T[K] | undefined;
                      readonly startsWith?: string | undefined;
                      readonly contains?: string | undefined;
                      readonly endsWith?: string | undefined;
                    }
                  | undefined
              : never;
      },
      never
    >
  | undefined;

type OrderByBase<T> = {
  readonly [K in keyof PickByValue<FieldsOf<T>, string | number | Date>]: 'asc' | 'desc';
};

export type OrderBy<T> = {
  readonly [K in keyof PickByValue<FieldsOf<T>, string | number | Date>]: {
    readonly [Ka in K]: OrderByBase<T>[Ka];
  } & Partial<OrderByBase<T>>;
}[keyof PickByValue<FieldsOf<T>, string | number | Date>];

export type FromRepository<T> = T & { readonly [latestVersion]: T };
