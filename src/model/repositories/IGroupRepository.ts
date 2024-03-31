import type { TResult } from '../../utils/result.ts';
import type { Group, IGroupProperties } from '../group/Group.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IGroupRepository {
  getOne<Id extends IGroupProperties['id']>(
    param: IGroupRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: Group<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends Group, Q extends IDaoRequestQuery<R>>(
    param: IGroupRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<Group, keyof IGroupProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IGroupProperties['id']>(
    param: IGroupRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IGroupRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IGroupRepositoryGetOneByIdParams<Id extends IGroupProperties['id']> {
  readonly id: Id;
}

export interface IGroupRepositoryGetManyParams<R extends Group, Q extends IDaoRequestQuery<R>> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IGroupRepositoryDeleteOneParams<Id extends IGroupProperties['id']> {
  readonly id: Id;
}

export interface IGroupRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<Group>;
}
