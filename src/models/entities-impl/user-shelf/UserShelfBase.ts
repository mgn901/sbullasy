import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IItemSummary } from '../../entities/item/IItemSummary.ts';
import { IUserShelf } from '../../entities/user-shelf/IUserShelf.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

/**
 * {@linkcode IUserShelf}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
class UserShelfInternal implements IUserShelf {
  public readonly __brand = 'IUserShelf';

  public readonly id: IUserShelf['id'];

  public readonly bookmarks: IUserShelf['bookmarks'];

  public constructor(userShelf: Pick<IUserShelf, 'id' | 'bookmarks'>) {
    this.id = userShelf.id;
    this.bookmarks = userShelf.bookmarks;
  }

  public setBookmarks(newBookmarks: IItemSummary[], selfContext: ISelfContext): IUserShelf {
    this.validateSelfContextOrThrow(selfContext);
    return new UserShelfInternal({
      ...this,
      bookmarks: this.bookmarks.toReplaced(...newBookmarks),
    });
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}

export abstract class UserShelfBase extends UserShelfInternal {}
