import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがグループの所属ユーザーであることを示す情報として用いる。
 */
export interface IGroupMemberContext {
  /**
   * 操作しようとしている所属ユーザーのユーザーID。
   */
  member: IUserProfile['id'];

  /**
   * 操作対象のグループの所属ユーザーに関する情報を持つエンティティクラス。
   */
  groupMemberDirectory: IGroupMemberDirectory;
}
