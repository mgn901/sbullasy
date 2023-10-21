import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがグループの管理者であることを示す情報として用いる。
 */
export interface IGroupAdminContext {
  /**
   * 操作しようとしている管理者のユーザーID。
   */
  admin: IUserProfile['id'];

  /**
   * 操作対象のグループの所属ユーザーに関する情報を持つエンティティクラス。
   */
  groupMemberDirectory: IGroupMemberDirectory;
}
