import { TEmailVerificationPurpose } from '../values/TEmailVerificationPurpose.ts';
import { IEmailVerificationAnswer } from '../entities/user/IEmailVerificationAnswer.ts';
import { IUser } from '../entities/user/IUser.ts';
import { IValidEmailVerificationAnswerContext } from './IValidEmailVerificationAnswerContext.ts';

/**
 * 操作を行おうとしているユーザーが、メール認証を通過していることを確認し、それを示す情報を返す。
 * @param emailVerificationAnswer メール認証に対する答え
 * @param user メール認証が必要な操作の対象のユーザーのエンティティオブジェクト。
 * @returns 操作を行おうとしているユーザーがメール認証を通過していることを示す情報。
 */
export const createValidEmailVerificationAnswerContextOrThrow = <
  F extends TEmailVerificationPurpose,
>(
  emailVerificationAnswer: IEmailVerificationAnswer<F>,
  user: IUser,
): IValidEmailVerificationAnswerContext<F> =>
  user.validateEmailVerificationAnswerOrThrow(emailVerificationAnswer);