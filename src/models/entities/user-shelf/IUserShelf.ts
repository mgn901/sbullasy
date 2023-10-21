import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IItemSummary } from '../item/IItemSummary.ts';
import { IUser } from '../user/IUser.ts';

/**
 * ユーザーを表すエンティティクラスで、ユーザーが気に入ったアイテムを管理するブックマークに関する情報を持つ。
 */
export interface IUserShelf {
  readonly __brand: 'IUserShelf';

  /**
   * ユーザーのID。
   */
  readonly id: IUser['id'];

  /**
   * ユーザーが保有しているブックマークの一覧。
   */
  bookmarks: IItemSummary[];

  /**
   *
   * @param bookmarks 変更後の値。
   * @param selfContext 変更しようとしているのがユーザー本人であることを示す情報。
   */
  setBookmarks(bookmarks: IItemSummary['id'][], selfContext: ISelfContext): void;
}
