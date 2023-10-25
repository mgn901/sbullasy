import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { createValidEmailVerificationAnswerContextOrThrow } from '../../../models/contexts/createValidEmailVerificationAnswerContextOrThrow.ts';
import { UserProfileImpl } from '../../../models/entities-impl/user-profile/UserProfileImpl.ts';
import { IUserProfile } from '../../../models/entities/user-profile/IUserProfile.ts';
import { IEmailVerificationAnswer } from '../../../models/entities/user/IEmailVerificationAnswer.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ユーザーのプロフィールを作成する。
 * @param param 作成するプロフィールの情報。
 * @param emailVerificationAnswer この操作のために作成したメール認証に対する回答。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したプロフィールのエンティティオブジェクト。
 */
export const createUserProfile = async (
  param: Pick<IUserProfile, 'name' | 'displayName'>,
  emailVerificationAnswer: IEmailVerificationAnswer<'setProfileExpiresAt'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IUserProfile> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);

  const validEmailVerificationAnswerContext = createValidEmailVerificationAnswerContextOrThrow(
    emailVerificationAnswer,
    user,
  );
  const selfContext = createSelfContextOrThrow(user);

  const userProfile = new UserProfileImpl(
    param,
    user,
    validEmailVerificationAnswerContext,
    selfContext,
  );

  await implementations.userProfileRepository.saveOne(userProfile, false);
  await implementations.userRepository.saveOne(user, true);

  return userProfile;
};
