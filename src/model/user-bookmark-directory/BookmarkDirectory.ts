import { exclude } from '../../utils/predicate.ts';
import { Success } from '../../utils/result.ts';
import type { TExcludeFromTuple } from '../../utils/tuple.ts';
import type { IUserProperties } from '../user/User.ts';
import { Bookmark, type IBookmarkProperties } from './Bookmark.ts';

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

  public toBookmarkAdded<
    ItemId extends IBookmarkProperties['itemId'],
    Tag extends IBookmarkProperties['tag'],
  >(param: { readonly itemId: ItemId; readonly tag: Tag }): Success<{
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
  >(param: { readonly itemId: ItemId; readonly tag: Tag }): Success<{
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
