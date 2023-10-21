import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがグループ管理者であることを示す情報として用いる。
 */
export interface IGroupAdminContext {
  /**
   * 操作しようとしているグループ管理者。
   */
  admin: IUserProfile['id'];
}
