import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { IUserProfile } from '../../../models/entities/user-profile/IUserProfile.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ユーザーのプロフィールの情報を変更する。
 * @param param 変更後のプロフィール。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateUserProfile = async (
  param: Pick<IUserProfile, 'name' | 'displayName'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const context = createSelfContextOrThrow(user);

  const userProfile = (
    await implementations.userProfileRepository.getOneByIdOrThrow(user.id)
  ).updateUserProfile(param, context);

  await implementations.userProfileRepository.saveOne(userProfile, true);
};
