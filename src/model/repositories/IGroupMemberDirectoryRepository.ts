import type { TResult } from '../../utils/result.ts';
import type {
  GroupMemberDirectory,
  IGroupMemberDirectoryProperties,
} from '../group-member-directory/GroupMemberDirectory.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IGroupMemberDirectoryRepository {
  getOne<Id extends IGroupMemberDirectoryProperties['id']>(
    param: IGroupMemberDirectoryRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: GroupMemberDirectory<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends GroupMemberDirectory, Q extends IDaoRequestQuery<R>>(
    param: IGroupMemberDirectoryRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<GroupMemberDirectory, keyof IGroupMemberDirectoryProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IGroupMemberDirectoryProperties['id']>(
    param: IGroupMemberDirectoryRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IGroupMemberDirectoryRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IGroupMemberDirectoryRepositoryGetOneByIdParams<
  Id extends IGroupMemberDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IGroupMemberDirectoryRepositoryGetManyParams<
  R extends GroupMemberDirectory,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IGroupMemberDirectoryRepositoryDeleteOneParams<
  Id extends IGroupMemberDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IGroupMemberDirectoryRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<GroupMemberDirectory>;
}
