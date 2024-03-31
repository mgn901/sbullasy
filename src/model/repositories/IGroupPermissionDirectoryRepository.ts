import type { TResult } from '../../utils/result.ts';
import type {
  GroupPermissionDirectory,
  IGroupPermissionDirectoryProperties,
} from '../group-permission-directory/GroupPermissionDirectory.ts';
import type { IGroupRepositoryDeleteOneParams } from './IGroupRepository.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IGroupPermissionDirectoryRepository {
  getOne<Id extends IGroupPermissionDirectoryProperties['id']>(
    param: IGroupPermissionDirectoryRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: GroupPermissionDirectory<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends GroupPermissionDirectory, Q extends IDaoRequestQuery<R>>(
    param: IGroupPermissionDirectoryRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<GroupPermissionDirectory, keyof IGroupPermissionDirectoryProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IGroupPermissionDirectoryProperties['id']>(
    param: IGroupRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IGroupPermissionDirectoryRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IGroupPermissionDirectoryRepositoryGetOneByIdParams<
  Id extends IGroupPermissionDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IGroupPermissionDirectoryRepositoryGetManyParams<
  R extends GroupPermissionDirectory,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IGroupPermissionDirectoryRepositoryDeleteOneParams<
  Id extends IGroupPermissionDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IGroupPermissionDirectoryRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<GroupPermissionDirectory>;
}
