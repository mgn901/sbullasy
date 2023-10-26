import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { createValidEmailVerificationAnswerContextOrThrow } from '../../../models/contexts/createValidEmailVerificationAnswerContextOrThrow.ts';
import { IAuthenticationToken } from '../../../models/entities/user/IAuthenticationToken.ts';
import { IEmailVerificationAnswer } from '../../../models/entities/user/IEmailVerificationAnswer.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * Bearer Tokenを作成する。
 * @param emailVerificationAnswer この操作のために作成したメール認証に対する回答。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したBearer Tokenのエンティティオブジェクト。
 */
export const createBearerToken = async (
  emailVerificationAnswer: IEmailVerificationAnswer<'createBearerToken'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IAuthenticationToken> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);

  const selfContext = createSelfContextOrThrow(user);
  const verificationContext = createValidEmailVerificationAnswerContextOrThrow(
    emailVerificationAnswer,
    user,
  );

  const token = user.createBearerToken(verificationContext, selfContext);

  await implementations.userRepository.saveOne(user, true);

  return token;
};
