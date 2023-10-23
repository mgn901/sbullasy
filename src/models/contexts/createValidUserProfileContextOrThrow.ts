import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { UserProfileExpiredException } from '../errors/UserProfileExpiredException.ts';
import { IValidUserProfileContext } from './IValidUserProfileContext.ts';

/**
 * 操作しようとしているユーザーが、有効なプロフィールを保有していることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作しようとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作しようとしているユーザーが、有効なプロフィールを保有していることを示す情報。
 */
export const createValidUserProfileContextOrThrow = (
  userProfile: IUserProfile,
  messageOnError: string = 'プロフィールの有効期限が切れているため、この操作を行うことはできません。',
): IValidUserProfileContext => {
  const now = new Date();
  const checkResult = userProfile.isValidAt(now);

  if (!checkResult) {
    throw new UserProfileExpiredException(messageOnError);
  }

  return {
    __brand: 'IValidUserProfileContext',
    userId: userProfile.id,
  };
};
