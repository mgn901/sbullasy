import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがインスタンスの管理者の所属ユーザーであることを示す情報。
 */
export interface IInstanceAdminContext {
  /**
   * インスタンスの管理者。
   */
  admin: IGroup;

  /**
   * インスタンスの管理者の所属ユーザーに関する情報を持つエンティティオブジェクト。
   */
  adminMemberDirectory: IGroupMemberDirectory;

  /**
   * 操作しようとしている所属ユーザーのユーザーID。
   */
  person: IUserProfile['id'];
}
