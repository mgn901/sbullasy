import { IUserProfile } from '../../../models/entities/user-profile/IUserProfile.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 自分のプロフィールを取得する。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 自分のプロフィールのエンティティオブジェクト。
 */
export const getUserProfile = async (
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IUserProfile> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);

  return userProfile;
};
