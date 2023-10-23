import { IEmailVerification } from '../entities/user/IEmailVerification.ts';
import { TEmailVerificationPurpose } from '../values/TEmailVerificationPurpose.ts';
import { IUser } from '../entities/user/IUser.ts';

/**
 * 操作しようとしているユーザーが、メール認証を通過していることを示す情報。
 */
export interface IValidEmailVerificationAnswerContext<F extends TEmailVerificationPurpose> {
  readonly __brand: 'IValidEmailVerificationAnswerContext';

  /**
   * 通過したメール認証のエンティティオブジェクト。
   */
  readonly emailVerification: IEmailVerification<F>;

  /**
   * 操作対象のユーザーのユーザーID。
   */
  readonly userId: IUser['id'];
}
