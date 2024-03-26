import type { IItemProperties } from '../item/Item.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';

const bookmarkTypeSymbol = Symbol('bookmarkTypeSymbol');

export interface IBookmarkProperties {
  readonly userId: IUserProperties['id'];
  readonly itemId: IItemProperties['id'];
  readonly tag: TDisplayName;
}

export class Bookmark<
  UserId extends IBookmarkProperties['userId'] = IBookmarkProperties['userId'],
  ItemId extends IBookmarkProperties['itemId'] = IBookmarkProperties['itemId'],
  Tag extends IBookmarkProperties['tag'] = IBookmarkProperties['tag'],
> {
  public readonly [bookmarkTypeSymbol]: unknown;
  public readonly userId: UserId;
  public readonly itemId: ItemId;
  public readonly tag: Tag;

  public static fromParam<
    UserId extends IBookmarkProperties['userId'],
    ItemId extends IBookmarkProperties['itemId'],
    Tag extends IBookmarkProperties['tag'],
  >(
    param: Pick<Bookmark<UserId, ItemId, Tag>, keyof IBookmarkProperties>,
  ): Bookmark<UserId, ItemId, Tag> {
    return new Bookmark(param);
  }

  private constructor(param: Pick<Bookmark<UserId, ItemId, Tag>, keyof IBookmarkProperties>) {
    this.userId = param.userId;
    this.itemId = param.itemId;
    this.tag = param.tag;
  }
}
