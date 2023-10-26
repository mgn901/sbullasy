import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IEmailVerification } from './IEmailVerification.ts';

/**
 * メール認証に対する回答を表すエンティティクラス。
 */
export interface IEmailVerificationAnswer<F extends TEmailVerificationPurpose> {
  readonly __brand: 'IEmailVerificationAnswer';

  /**
   * 回答するメール認証のID。
   */
  readonly id: IEmailVerification<F>['id'];

  /**
   * 回答するメール認証の目的。
   */
  readonly for: F;

  /**
   * 回答する認証コード。
   */
  readonly answer: TShortSecret;
}
