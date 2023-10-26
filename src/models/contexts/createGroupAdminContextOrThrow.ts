import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotGroupAdminException } from '../errors/NotGroupAdminException.ts';
import { IGroupAdminContext } from './IGroupAdminContext.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のグループの管理者であることを確認し、それを示す情報を作成する。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作を行おうとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param groupMemberDirectory 操作対象のグループの所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作を行おうとしているユーザーが、操作対象のグループの管理者であることを示す情報。
 * @throws 操作を行おうとしているユーザーが、操作対象のグループの管理者ではなかった場合、{@linkcode NotGroupAdminException}を発生させる。
 */
export const createGroupAdminContextOrThrow = (
  userProfile: IUserProfile,
  groupMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'グループの管理者以外のユーザーがこの操作を行うことはできません。',
): IGroupAdminContext => {
  const checkResult = groupMemberDirectory.members.find(
    (member) => member.user.id === userProfile.id && member.type === 'admin',
  );

  if (!checkResult) {
    throw new NotGroupAdminException(messageOnError);
  }

  return {
    __brand: 'IGroupAdminContext',
    groupId: groupMemberDirectory.id,
  };
};
