import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { createValidEmailVerificationAnswerContextOrThrow } from '../../../models/contexts/createValidEmailVerificationAnswerContextOrThrow.ts';
import { IEmailVerificationAnswer } from '../../../models/entities/user/IEmailVerificationAnswer.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ユーザーのプロフィールの有効期限を変更する。
 * @param emailVerificationAnswer この操作のために作成したメール認証に対する回答。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateUserProfileExpiresAt = async (
  emailVerificationAnswer: IEmailVerificationAnswer<'setProfileExpiresAt'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);

  const validEmailVerificationAnswerContext = createValidEmailVerificationAnswerContextOrThrow(
    emailVerificationAnswer,
    user,
  );
  const selfContext = createSelfContextOrThrow(user);

  userProfile.setExpiresAt(validEmailVerificationAnswerContext, selfContext, user);

  await implementations.userProfileRepository.saveOne(userProfile, true);
  await implementations.userRepository.saveOne(user, true);
};
