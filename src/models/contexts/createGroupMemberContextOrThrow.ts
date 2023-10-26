import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotGroupMemberException } from '../errors/NotGroupMemberException.ts';
import { IGroupMemberContext } from './IGroupMemberContext.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のグループの所属ユーザーであることを確認し、それを示す情報を作成する。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作を行おうとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param groupMemberDirectory 操作対象のグループの所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作を行おうとしているユーザーが、操作対象のグループの所属ユーザーであることを示す情報。
 * @throws 操作を行おうとしているユーザーが、操作対象のグループの所属ユーザーではなかった場合、{@linkcode NotGroupMemberException}を発生させる。
 */
export const createGroupMemberContextOrThrow = (
  userProfile: IUserProfile,
  groupMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'グループの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): IGroupMemberContext => {
  const now = new Date();
  const checkResult =
    userProfile.isValidAt(now) &&
    groupMemberDirectory.members.find((member) => member.user.id === userProfile.id);

  if (!checkResult) {
    throw new NotGroupMemberException(messageOnError);
  }

  return {
    __brand: 'IGroupMemberContext',
    groupId: groupMemberDirectory.id,
  };
};
