import type { TResult } from '../../utils/result.ts';
import type { GroupProfile, IGroupProfileProperties } from '../group-profile/GroupProfile.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IGroupProfileRepository {
  getOne<Id extends IGroupProfileProperties['id']>(
    param: IGroupProfileRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: GroupProfile<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<Name extends IGroupProfileProperties['name']>(
    param: IGroupProfileRepositoryGetOneByNameParams<Name>,
  ): Promise<
    TResult<
      {
        readonly item: GroupProfile<IGroupProfileProperties['id'], Name>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends GroupProfile, Q extends IDaoRequestQuery<R>>(
    param: IGroupProfileRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<GroupProfile, keyof IGroupProfileProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IGroupProfileProperties['id']>(
    param: IGroupProfileRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IGroupProfileRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IGroupProfileRepositoryGetOneByIdParams<
  Name extends IGroupProfileProperties['id'],
> {
  readonly id: Name;
}

export interface IGroupProfileRepositoryGetOneByNameParams<
  Name extends IGroupProfileProperties['name'],
> {
  readonly name: Name;
}

export interface IGroupProfileRepositoryDeleteOneParams<Id extends IGroupProfileProperties['id']> {
  readonly id: Id;
}

export interface IGroupProfileRepositoryGetManyParams<
  R extends GroupProfile,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IGroupProfileRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<GroupProfile>;
}
