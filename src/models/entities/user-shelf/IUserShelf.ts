import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
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
  bookmarks: ArrayWithDiff<IItemSummary>;

  /**
   * ブックマークの一覧を変更する。
   * **この操作はミュータブルである。**
   * @param newBookmarks 変更後の値。
   * @param selfContext この操作を行おうとしているユーザーが操作対象のユーザー本人であることを示す情報。
   */
  setBookmarks(newBookmarks: IItemSummary[], selfContext: ISelfContext): void;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。。
   */
  validateSelfContextOrThrow(context: ISelfContext): void;
}
