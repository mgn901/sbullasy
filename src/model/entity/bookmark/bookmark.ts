import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
  PreAppliedVerifyAccessToken,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { Item, ItemId, WithDetailedLinks } from '../item/item.ts';
import type { ItemTypeName } from '../item/item-type.ts';
import type { UserId } from '../user/user-account.ts';

//#region Bookmark and BookmarkRepository
export const bookmarkTypeSymbol = Symbol('bookmark.type');

/**
 * ブックマークを表す。
 */
export type Bookmark = {
  readonly [bookmarkTypeSymbol]: typeof bookmarkTypeSymbol;
  readonly typeName: ItemTypeName;
  readonly itemId: ItemId;
  readonly bookmarkedBy: UserId;
  readonly createdAt: Date;
};

export const bookmarkDetailedTypeSymbol = Symbol('bookmarkDetailed.type');

export type BookmarkDetailed = Pick<Bookmark, 'createdAt'> & {
  readonly [bookmarkDetailedTypeSymbol]: typeof bookmarkDetailedTypeSymbol;
  readonly item: WithDetailedLinks<Item>;
};

/**
 * {@linkcode Bookmark}の状態を変更するための関数を提供する。
 */
export const BookmarkReducers = {
  create: <
    P extends {
      readonly typeName: TTYpeName;
      readonly itemId: TItemId;
      readonly bookmarkedBy: TCreatedBy;
    },
    TTYpeName extends ItemTypeName,
    TItemId extends ItemId,
    TCreatedBy extends UserId,
  >(
    params: P,
  ): Bookmark & Pick<P, 'typeName' | 'itemId' | 'bookmarkedBy'> => ({
    [bookmarkTypeSymbol]: bookmarkTypeSymbol,
    typeName: params.typeName,
    itemId: params.itemId,
    bookmarkedBy: params.bookmarkedBy,
    createdAt: new Date(),
  }),
};

/**
 * {@linkcode Bookmark}を永続化するためのリポジトリ。
 */
export interface BookmarkRepository {
  getMany(
    this: BookmarkRepository,
    params: {
      readonly filters?: Filters<Bookmark>;
      readonly orderBy: OrderBy<Bookmark>;
      readonly limit?: number | undefined;
      readonly offset?: number | undefined;
    },
  ): Promise<readonly FromRepository<Bookmark>[] | readonly []>;

  getDetailedMany(
    this: BookmarkRepository,
    params: {
      readonly filters?: Filters<Item & { readonly bookmarkedBy: UserId }>;
      readonly orderBy: OrderBy<Item & { readonly bookmarkedBy: UserId }>;
      readonly limit?: number | undefined;
      readonly offset?: number | undefined;
    },
  ): Promise<readonly FromRepository<BookmarkDetailed>[] | readonly []>;

  count(
    this: BookmarkRepository,
    params: { readonly filters?: Filters<Bookmark> },
  ): Promise<number>;

  createOne(this: BookmarkRepository, bookmark: Bookmark): Promise<void>;

  deleteOne(
    this: BookmarkRepository,
    params: {
      readonly typeName: ItemTypeName;
      readonly itemId: ItemId;
      readonly bookmarkedBy: UserId;
    },
  ): Promise<void>;

  deleteMany(
    this: BookmarkRepository,
    params: { readonly filters: Filters<Bookmark> },
  ): Promise<void>;
}
//#endregion

//#region BookmarkService
export interface BookmarkServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly bookmarkRepository: BookmarkRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 自分のブックマークの一覧を取得する。
 */
export const getMany = async (
  params: {
    readonly filters?: Filters<Item>;
    readonly orderBy: OrderBy<Item>;
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
  } & BookmarkServiceDependencies,
): Promise<readonly FromRepository<BookmarkDetailed>[] | readonly []> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  return params.bookmarkRepository.getDetailedMany({
    filters: { ...params.filters, bookmarkedBy: myUserAccount.id },
    orderBy: params.orderBy,
    limit: params.limit,
    offset: params.offset,
  });
};

/**
 * 指定されたアイテムをブックマークする。
 */
export const createOne = async (
  params: {
    readonly typeName: ItemTypeName;
    readonly itemId: ItemId;
  } & BookmarkServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const bookmark = BookmarkReducers.create({
    typeName: params.typeName,
    itemId: params.itemId,
    bookmarkedBy: myUserAccount.id,
  });
  await params.bookmarkRepository.createOne(bookmark);
};

/**
 * 指定されたブックマークを削除する。
 */
export const deleteOne = async (
  params: {
    readonly typeName: ItemTypeName;
    readonly itemId: ItemId;
  } & BookmarkServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.bookmarkRepository.deleteOne({
    typeName: params.typeName,
    itemId: params.itemId,
    bookmarkedBy: myUserAccount.id,
  });
};
//#endregion
