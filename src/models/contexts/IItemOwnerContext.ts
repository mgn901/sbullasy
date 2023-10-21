import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';

/**
 * 操作しようとしているのがアイテムの所有者の所属ユーザーであることを示す情報として用いる。
 */
export interface IItemOwnerContext {
  /**
   * アイテムの所有者。
   */
  owner: IGroup;

  /**
   * アイテムの所有者の所属ユーザーに関する情報を持つエンティティオブジェクト。
   */
  ownerMemberDirectory: IGroupMemberDirectory;

  /**
   * 操作しようとしている所属ユーザー。
   */
  person: IUserProfile['id'];
}
