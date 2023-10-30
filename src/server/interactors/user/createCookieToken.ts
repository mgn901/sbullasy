import { createValidEmailVerificationAnswerContextOrThrow } from '../../../models/contexts/createValidEmailVerificationAnswerContextOrThrow.ts';
import { IAuthenticationToken } from '../../../models/entities/user/IAuthenticationToken.ts';
import { IEmailVerificationAnswer } from '../../../models/entities/user/IEmailVerificationAnswer.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * Cookie Tokenを作成する。
 * @param userId Cookie Tokenを作成するユーザーのユーザーID。
 * @param emailVerificationAnswer この操作のために作成したメール認証に対する回答。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したCookie Tokenのエンティティオブジェクト。
 */
export const createCookieToken = async (
  userId: IUser['id'],
  emailVerificationAnswer: IEmailVerificationAnswer<'createCookieToken'>,
  implementations: IImplementations,
): Promise<IAuthenticationToken> => {
  const user = await implementations.userRepository.getOneByIdOrThrow(userId);

  const context = createValidEmailVerificationAnswerContextOrThrow(emailVerificationAnswer, user);

  const { newUser, newToken } = user.createCookieToken(context);

  await implementations.userRepository.saveOne(newUser, true);

  return newToken;
};
