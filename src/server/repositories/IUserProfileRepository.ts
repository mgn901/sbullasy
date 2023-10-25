import { IUserProfile } from '../../models/entities/user-profile/IUserProfile.ts';

/**
 * {@linkcode IUserProfile}のリポジトリ。
 */
export interface IUserProfileRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param userId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(userId: IUserProfile['id']): Promise<IUserProfile>;

  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param userName 取得するオブジェクトのID。
   */
  getOneByNameOrThrow(userName: IUserProfile['name']): Promise<IUserProfile>;

  /**
   * オブジェクトを永続化する。
   * @param userProfile 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(userProfile: IUserProfile, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param userId 削除するオブジェクトのID。
   */
  deleteOneById(userId: IUserProfile['id']): Promise<void>;
}
