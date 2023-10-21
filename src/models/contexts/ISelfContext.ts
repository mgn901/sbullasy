import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがユーザー本人であることを示す情報として用いる。
 */
export interface ISelfContext {
  /**
   * 操作しようとしているユーザーのユーザーID。
   */
  self: IUserProfile['id'];
}
