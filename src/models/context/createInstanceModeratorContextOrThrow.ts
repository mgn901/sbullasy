import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../entities/group/IGroup.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotInstanceModeratorException } from '../errors/NotInstanceModeratorException.ts';
import { IInstanceModeratorContext } from './IInstanceModeratorContext.ts';

/**
 * 操作しようとしているユーザーが、インスタンスのモデレーターの所属ユーザーであることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作しようとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param group インスタンスのモデレーターのエンティティオブジェクト。
 * @param groupMemberDirectory インスタンスのモデレーターの所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作しようとしているユーザーが、インスタンスのモデレーターの所属ユーザーであることを示す情報。
 * @throws 操作しようとしているユーザーが、インスタンスのモデレーターの所属ユーザーではなかった場合、{@linkcode NotInstanceModeratorException}を発生させる。
 */
export const createInstanceModeratorContextOrThrow = (
  userProfile: IUserProfile,
  group: IGroup,
  groupMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'インスタンスのモデレーターの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): IInstanceModeratorContext => {
  const checkResult =
    group.instanceRole === 'moderator' &&
    groupMemberDirectory.members.find((member) => member.user.id === userProfile.id);

  if (!checkResult) {
    throw new NotInstanceModeratorException(messageOnError);
  }

  return {
    __brand: 'IInstanceModeratorContext',
  };
};
