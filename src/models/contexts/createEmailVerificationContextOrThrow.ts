import { TEmailVerificationPurpose } from '../values/TEmailVerificationPurpose.ts';
import { IEmailVerificationAnswer } from '../entities/user/IEmailVerificationAnswer.ts';
import { IUser } from '../entities/user/IUser.ts';
import { IValidEmailVerificationAnswerContext } from './IValidEmailVerificationAnswerContext.ts';

/**
 * 操作しようとしているユーザーが、メール認証を通過していることを確認し、それを示す情報を返す。
 * @param emailVerificationAnswer メール認証に対する答え
 * @param user メール認証が必要な操作の対象のユーザーのエンティティオブジェクト。
 * @returns 操作しようとしているユーザーがメール認証を通過していることを示す情報。
 */
export const createEmailVerificationContextOrThrow = <F extends TEmailVerificationPurpose>(
  emailVerificationAnswer: IEmailVerificationAnswer<F>,
  user: IUser,
): IValidEmailVerificationAnswerContext<F> =>
  user.validateEmailVerificationAnswerAndExpireOrThrow(emailVerificationAnswer);
