import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';

export type GetOneBy<T, TId, TKeyOfId extends keyof T> = <VId extends TId>(
  this: unknown,
  id: VId,
) => Promise<(FromRepository<T> & { readonly [K in TKeyOfId]: VId }) | undefined>;

export type GetMany<T> = (
  this: unknown,
  params: {
    readonly filters?: Filters<T> | undefined;
    readonly orderBy: OrderBy<T>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  },
) => Promise<readonly FromRepository<T>[] | readonly []>;

export type Count<T> = (
  this: unknown,
  params: { readonly filters?: Filters<T> },
) => Promise<number>;

export type CreateOne<T> = (this: unknown, value: T) => Promise<void>;

export type UpdateOne<T> = (this: unknown, value: T) => Promise<void>;

export type DeleteOneBy<TId> = (this: unknown, id: TId) => Promise<void>;

export type DeleteMany<T> = (
  this: unknown,
  params: { readonly filters?: Filters<T> },
) => Promise<void>;

export type ReadonlyRepository<T> = {
  readonly getMany: GetMany<T>;
  readonly count: Count<T>;
};

export type Repository<T> = ReadonlyRepository<T> & {
  readonly createOne: CreateOne<T>;
  readonly deleteMany: DeleteMany<T>;
};

export type MutableRepository<T> = Repository<T> & {
  readonly updateOne: UpdateOne<T>;
};
