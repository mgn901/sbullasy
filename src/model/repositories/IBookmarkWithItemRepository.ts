import type { TResult } from '../../utils/result.ts';
import type { BookmarkWithItem } from '../user-bookmark-directory/BookmarkWithItem.ts';
import type { DaoException, IDaoRequestOptions, IDaoRequestQuery } from './dao-types.ts';

export interface IBookmarkWithItemRepository {
  getMany<R extends BookmarkWithItem, Q extends IDaoRequestQuery<R>>(
    param: IBookmarkWithItemRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;
}

export interface IBookmarkWithItemRepositoryGetManyParams<
  R extends BookmarkWithItem,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}
