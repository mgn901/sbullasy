import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { IUser } from '../entities/user/IUser.ts';
import { NotSelfException } from '../errors/NotSelfException.ts';
import { ISelfContext } from './ISelfContext.ts';

/**
 * 操作しようとしているユーザーが、操作対象のユーザー本人であることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作しようとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param user 操作対象のユーザーのエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作しようとしているユーザーが、操作対象のユーザー本人であることを示す情報。
 * @throws 操作しようとしているユーザーが、操作対象のユーザー本人ではなかった場合、{@linkcode NotSelfException}を発生させる。
 */
export const createSelfContextOrThrow = (
  userProfile: IUserProfile,
  user: IUser,
  messageOnError: string = '本人以外のユーザーがこの操作を行うことはできません。',
): ISelfContext => {
  const checkResult = userProfile.id === user.id;

  if (!checkResult) {
    throw new NotSelfException(messageOnError);
  }

  return {
    __brand: 'ISelfContext',
    userId: user.id,
  };
};
