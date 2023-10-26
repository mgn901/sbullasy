import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotInstanceOperatorException } from '../errors/NotInstanceOperatorException.ts';
import { IInstanceOperatorContext } from './IInstanceOperatorContext.ts';

/**
 * 操作を行おうとしているユーザーが、インスタンスのオペレーターの所属ユーザーであることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作を行おうとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param group インスタンスのオペレーターのエンティティオブジェクト。
 * @param groupMemberDirectory インスタンスのオペレーターの所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作を行おうとしているユーザーが、インスタンスのオペレーターの所属ユーザーであることを示す情報。
 * @throws 操作を行おうとしているユーザーが、インスタンスのオペレーターの所属ユーザーではなかった場合、{@linkcode NotInstanceOperatorException}を発生させる。
 */
export const createInstanceOperatorContextOrThrow = (
  userProfile: IUserProfile,
  group: IGroup,
  groupMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'インスタンスのオペレーターの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): IInstanceOperatorContext => {
  const checkResult =
    group.instanceRole === 'operator' &&
    groupMemberDirectory.members.find((member) => member.user.id === userProfile.id);

  if (!checkResult) {
    throw new NotInstanceOperatorException(messageOnError);
  }

  return {
    __brand: 'IInstanceOperatorContext',
  };
};
