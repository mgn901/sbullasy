import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotInstanceAdminException } from '../errors/NotInstanceAdminException.ts';
import { IInstanceAdminContext } from './IInstanceAdminContext.ts';

/**
 * 操作しようとしているユーザーが、インスタンスの管理者の所属ユーザーであることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作しようとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param group インスタンスの管理者のエンティティオブジェクト。
 * @param groupMemberDirectory インスタンスの管理者の所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作しようとしているユーザーが、インスタンスの管理者の所属ユーザーであることを示す情報。
 * @throws 操作しようとしているユーザーが、インスタンスの管理者の所属ユーザーではなかった場合、{@linkcode NotInstanceAdminException}を発生させる。
 */
export const createInstanceAdminContextOrThrow = (
  userProfile: IUserProfile,
  group: IGroup,
  groupMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'インスタンスの管理者の所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): IInstanceAdminContext => {
  const checkResult =
    group.instanceRole === 'admin' &&
    groupMemberDirectory.members.find((member) => member.user.id === userProfile.id);

  if (!checkResult) {
    throw new NotInstanceAdminException(messageOnError);
  }

  return {
    __brand: 'IInstanceAdminContext',
  };
};
