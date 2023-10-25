import { IUserShelf } from '../../models/entities/user-shelf/IUserShelf.ts';

/**
 * {@linkcode IUserShelf}のリポジトリ。
 */
export interface IUserShelfRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param userId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(userId: IUserShelf['id']): Promise<IUserShelf>;

  /**
   * オブジェクトを永続化する。
   * @param userShelf 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(userShelf: IUserShelf, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param userId 削除するオブジェクトのID。
   */
  deleteOneById(userId: IUserShelf['id']): Promise<void>;
}
