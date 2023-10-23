import { ISelfContext } from '../../context/ISelfContext.ts';
import { IItemSummary } from '../../entities/item/IItemSummary.ts';
import { IUserShelf } from '../../entities/user-shelf/IUserShelf.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

/**
 * {@linkcode IUserShelf}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class UserShelfBase implements IUserShelf {
  public readonly __brand = 'IUserShelf';

  public readonly id: IUserShelf['id'];

  private readonly _bookmarks: IUserShelf['bookmarks'];

  public constructor(userShelf: Pick<IUserShelf, 'id' | 'bookmarks'>) {
    this.id = userShelf.id;
    this._bookmarks = userShelf.bookmarks;
  }

  public get bookmarks() {
    return this._bookmarks;
  }

  public setBookmarks(newBookmarks: IItemSummary[], selfContext: ISelfContext): void {
    this.validateSelfContextOrThrow(selfContext);
    this._bookmarks.replace(...newBookmarks);
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
