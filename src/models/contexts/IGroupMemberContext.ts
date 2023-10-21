import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがグループの所属ユーザーであることを示す情報として用いる。
 */
export interface IGroupMemberContext {
  /**
   * 操作しようとしている所属ユーザー。
   */
  member: IUserProfile['id'];
}
