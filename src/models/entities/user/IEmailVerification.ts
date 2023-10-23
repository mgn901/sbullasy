import { TEmail } from '../../values/TEmail.ts';
import { TId } from '../../values/TId.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IUser } from './IUser.ts';
import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';

/**
 * メール認証を表すエンティティクラス。
 */
export interface IEmailVerification<F extends TEmailVerificationPurpose> {
  readonly __brand: 'IEmailVerification';

  /**
   * メール認証のID。
   */
  readonly id: TId<IEmailVerification<F>>;

  /**
   * メール認証の作成日時。
   */
  readonly createdAt: Date;

  /**
   * メール認証の有効期限。
   */
  readonly expiresAt: Date;

  /**
   * メール認証の目的。
   * - `'cookieToken'`: クッキーとして用いるトークンを
   */
  readonly for: F;

  /**
   * メール認証の認証コードの送信先。
   */
  readonly email: TEmail;

  /**
   * メール認証しようとしているユーザー。
   */
  readonly userId: IUser['id'];

  /**
   * 渡された認証コードが正解であるかどうかを確認する。
   * @param answer 回答する認証コード。
   */
  check(answer: TShortSecret): boolean;

  /**
   * ある日時においてメール認証が有効であるかどうか。
   * @param date 日時の指定。この日時においてメール認証が有効であるかどうかを返す。
   */
  isValidAt(date: Date): boolean;

  /**
   * 認証コードを取得する。
   * このメソッドはリポジトリ等の実装のために用いるものであり、ビジネスロジックの中で用いてはならない。
   */
  dangerouslyGetSecret(): TShortSecret;
}
