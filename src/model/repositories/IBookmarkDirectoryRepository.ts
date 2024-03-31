import type { TResult } from '../../utils/result.ts';
import type {
  BookmarkDirectory,
  IBookmarkDirectoryProperties,
} from '../user-bookmark-directory/BookmarkDirectory.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IBookmarkDirectoryRepository {
  getOne<Id extends IBookmarkDirectoryProperties['id']>(
    param: IBookmarkDirectoryRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: BookmarkDirectory<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends BookmarkDirectory, Q extends IDaoRequestQuery<R>>(
    param: IBookmarkDirectoryRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<BookmarkDirectory, keyof IBookmarkDirectoryProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IBookmarkDirectoryProperties['id']>(
    param: IBookmarkDirectoryRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IBookmarkDirectoryRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IBookmarkDirectoryRepositoryGetOneByIdParams<
  Id extends IBookmarkDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IBookmarkDirectoryRepositoryGetManyParams<
  R extends BookmarkDirectory,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IBookmarkDirectoryRepositoryDeleteOneParams<
  Id extends IBookmarkDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IBookmarkDirectoryRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<BookmarkDirectory>;
}
