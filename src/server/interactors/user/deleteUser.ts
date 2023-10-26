import { createValidEmailVerificationAnswerContextOrThrow } from '../../../models/contexts/createValidEmailVerificationAnswerContextOrThrow.ts';
import { IEmailVerificationAnswer } from '../../../models/entities/user/IEmailVerificationAnswer.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ユーザーを削除する。
 * @param emailVerificationAnswer この操作のために作成したメール認証に対する回答。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteUser = async (
  emailVerificationAnswer: IEmailVerificationAnswer<'unregister'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);

  createValidEmailVerificationAnswerContextOrThrow(emailVerificationAnswer, user);

  await implementations.userRepository.deleteOneById(user.id);
};
