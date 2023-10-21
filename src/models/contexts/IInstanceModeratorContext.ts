import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがインスタンスのモデレーターの所属ユーザーであることを示す情報。
 */
export interface IInstanceModeratorContext {
  /**
   * インスタンスのモデレーター。
   */
  moderator: IGroup;

  /**
   * インスタンスのモデレーターの所属ユーザーに関する情報を持つエンティティオブジェクト。
   */
  moderatorMemberDirectory: IGroupMemberDirectory;

  /**
   * 操作しようとしている所属ユーザー。
   */
  person: IUserProfile['id'];
}
