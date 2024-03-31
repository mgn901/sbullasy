import { exclude } from '../../utils/predicate.ts';
import { Success } from '../../utils/result.ts';
import type { TExcludeFromTuple } from '../../utils/tuple.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import type { IBookmarkDirectoryRepositoryGetOneByIdParams } from '../repositories/IBookmarkDirectoryRepository.ts';
import type { IBookmarkWithItemRepositoryGetManyParams } from '../repositories/IBookmarkWithItemRepository.ts';
import type { IUserProperties } from '../user/User.ts';
import { Bookmark, type IBookmarkProperties } from './Bookmark.ts';
import type { BookmarkWithItem, IBookmarkWithItemProperties } from './BookmarkWithItem.ts';

const bookmarkDirectoryTypeSymbol = Symbol('bookmarkDirectoryTypeSymbol');

export interface IBookmarkDirectoryProperties {
  readonly id: IUserProperties['id'];
  readonly bookmarks: readonly Bookmark[];
}

export class BookmarkDirectory<
  Id extends IBookmarkDirectoryProperties['id'] = IBookmarkDirectoryProperties['id'],
  Bookmarks extends
    IBookmarkDirectoryProperties['bookmarks'] = IBookmarkDirectoryProperties['bookmarks'],
> {
  public readonly [bookmarkDirectoryTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly bookmarks: Bookmarks;

  public static createGetByIdRequest<Id extends IBookmarkDirectoryProperties['id']>(param: {
    readonly id: Id;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly daoRequest: IBookmarkDirectoryRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public createGetBookmarksRequest(param: {
    readonly query?: Pick<
      NonNullable<
        IBookmarkWithItemRepositoryGetManyParams<
          BookmarkWithItem,
          { readonly tag?: IBookmarkWithItemProperties['tag'] }
        >['query']
      >,
      'tag'
    >;
    readonly options?: IBookmarkWithItemRepositoryGetManyParams<
      BookmarkWithItem,
      { readonly tag?: IBookmarkWithItemProperties['tag'] }
    >['options'];
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly daoRequest: IBookmarkWithItemRepositoryGetManyParams<
      BookmarkWithItem,
      { readonly tag?: IBookmarkWithItemProperties['tag']; readonly userId: Id }
    >;
  }> {
    return new Success({
      daoRequest: {
        query: { ...(param.query ?? {}), userId: this.id },
        options: param.options,
      },
    });
  }

  public toBookmarkAdded<
    ItemId extends IBookmarkProperties['itemId'],
    Tag extends IBookmarkProperties['tag'],
  >(param: {
    readonly itemId: ItemId;
    readonly tag: Tag;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly bookmarkDirectory: BookmarkDirectory<
      Id,
      readonly [...Bookmarks, Bookmark<Id, ItemId, Tag>]
    >;
  }> {
    return new Success({
      bookmarkDirectory: BookmarkDirectory.fromParam({
        id: this.id,
        bookmarks: [
          ...this.bookmarks,
          Bookmark.fromParam({ userId: this.id, itemId: param.itemId, tag: param.tag }),
        ] as const,
      }),
    });
  }

  public toBookmarkRemoved<
    ItemId extends IBookmarkProperties['itemId'],
    Tag extends IBookmarkProperties['tag'],
  >(param: {
    readonly itemId: ItemId;
    readonly tag: Tag;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly bookmarkDirectory: BookmarkDirectory<
      Id,
      TExcludeFromTuple<Bookmarks, Bookmark<Id, ItemId, Tag>>
    >;
  }> {
    return new Success({
      bookmarkDirectory: BookmarkDirectory.fromParam({
        id: this.id,
        bookmarks: this.bookmarks.filter(
          exclude<Bookmark, Bookmark<Id, ItemId, Tag>>({ itemId: param.itemId, tag: param.tag }),
        ),
      }),
    });
  }

  public static fromParam<
    Id extends IBookmarkDirectoryProperties['id'],
    Bookmarks extends IBookmarkDirectoryProperties['bookmarks'],
  >(
    param: Pick<BookmarkDirectory<Id, Bookmarks>, keyof IBookmarkDirectoryProperties>,
  ): BookmarkDirectory<Id, Bookmarks> {
    return new BookmarkDirectory(param);
  }

  private constructor(
    param: Pick<BookmarkDirectory<Id, Bookmarks>, keyof IBookmarkDirectoryProperties>,
  ) {
    this.id = param.id;
    this.bookmarks = param.bookmarks;
  }
}
