import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { ISelfContext } from '../../context/ISelfContext.ts';
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
  bookmarks: ArrayWithDiff<IItemSummary>;

  /**
   *
   * @param bookmarks 変更後の値。
   * @param selfContext 変更しようとしているのがユーザー本人であることを示す情報。
   */
  setBookmarks(bookmarks: IItemSummary[], selfContext: ISelfContext): void;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。。
   */
  validateSelfContextOrThrow(context: ISelfContext): void;
}
