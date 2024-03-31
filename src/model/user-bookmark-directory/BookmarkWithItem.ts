import type { IBookmarkProperties } from './Bookmark.ts';

const bookmarkWithItemTypeSymbol = Symbol('bookmarkWithItemTypeSymbol');

export interface IBookmarkWithItemProperties {
  readonly userId: IBookmarkProperties['userId'];
  readonly item: IBookmarkProperties['itemId'];
  readonly tag: IBookmarkProperties['tag'];
}

export class BookmarkWithItem<
  UserId extends IBookmarkWithItemProperties['userId'] = IBookmarkWithItemProperties['userId'],
  ItemObj extends IBookmarkWithItemProperties['item'] = IBookmarkWithItemProperties['item'],
  Tag extends IBookmarkWithItemProperties['tag'] = IBookmarkWithItemProperties['tag'],
> {
  public readonly [bookmarkWithItemTypeSymbol]: unknown;
  public readonly userId: UserId;
  public readonly item: ItemObj;
  public readonly tag: Tag;

  public static fromParam<
    UserId extends IBookmarkWithItemProperties['userId'],
    ItemObj extends IBookmarkWithItemProperties['item'],
    Tag extends IBookmarkWithItemProperties['tag'],
  >(
    param: Pick<BookmarkWithItem<UserId, ItemObj, Tag>, keyof IBookmarkWithItemProperties>,
  ): BookmarkWithItem<UserId, ItemObj, Tag> {
    return new BookmarkWithItem(param);
  }

  private constructor(
    param: Pick<BookmarkWithItem<UserId, ItemObj, Tag>, keyof IBookmarkWithItemProperties>,
  ) {
    this.userId = param.userId;
    this.item = param.item;
    this.tag = param.tag;
  }
}
