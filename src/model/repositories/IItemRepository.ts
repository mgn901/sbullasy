import type { TResult } from '../../utils/result.ts';
import type { IItemProperties, Item } from '../item/Item.ts';
import type { IItemSearchRequest, ITemplateProperties } from '../template/Template.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IItemRepository {
  getOne<Id extends IItemProperties['id']>(
    param: IItemRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: Item<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<TitleForUrl extends IItemProperties['titleForUrl']>(
    param: IItemRepositoryGetOneByTitleForUrlParams<TitleForUrl>,
  ): Promise<
    TResult<
      {
        readonly item: Item<IItemProperties['id'], IItemProperties['title'], TitleForUrl>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends Item, Q extends IDaoRequestQuery<R>>(
    param: IItemRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  search(param: IItemSearchRequest<ITemplateProperties['propertiesSchema']>): Promise<
    TResult<
      {
        readonly items: Item[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<Item, keyof IItemProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IItemProperties['id']>(
    param: IItemRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IItemRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IItemRepositoryGetOneByIdParams<Id extends IItemProperties['id']> {
  readonly id: Id;
}

export interface IItemRepositoryGetOneByTitleForUrlParams<
  TitleForUrl extends IItemProperties['titleForUrl'],
> {
  readonly titleForUrl: TitleForUrl;
}

export interface IItemRepositoryGetManyParams<R extends Item, Q extends IDaoRequestQuery<R>> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IItemRepositoryDeleteOneParams<Id extends IItemProperties['id']> {
  readonly id: Id;
}

export interface IItemRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<Item>;
}
