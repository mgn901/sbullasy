import { TId } from '../../values/TId.ts';
import { IEmailVerification } from './IEmailVerification.ts';

/**
 * メールアドレス認証に対する回答を表すエンティティクラス。
 */
export interface IEmailVerificationAnswer {
  readonly __brand: 'IEmailVerificationAnswer';

  /**
   * 回答するメールアドレス認証のID。
   */
  readonly id: TId<IEmailVerification>;

  /**
   * メールアドレス認証に対する答え。
   */
  readonly answer: IEmailVerification['secret'];
}
