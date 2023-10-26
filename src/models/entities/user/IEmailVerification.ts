import { TEmail } from '../../values/TEmail.ts';
import { TId } from '../../values/TId.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IUser } from './IUser.ts';
import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';

/**
 * メール認証を表すエンティティクラス。
 *
 * メール認証は、クライアントが指定したEメールアドレスに対して、アプリケーションが認証コードを含んだメールを送信し、
 * その認証コードをクライアントに入力させることで、
 * クライアントの持ち主とメールアドレスの持ち主が一致することを確認するものである。
 *
 * スバラシにはメール認証を要する操作が存在する。
 * 該当する操作を行う場合、その操作を行う前に、まずメール認証を作成する必要がある。
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
   * - `'createCookieToken'`: Cookieとして用いるトークンを作成する。
   * - `'createBearerToken'`: Bearer Tokenとして用いるトークンを作成する。
   * - `'setEmail'`: ユーザーのEメールアドレスを変更する。
   * - `'setProfileExpiresAt'`: ユーザーのプロフィールの有効期限を変更する。
   * - `'unregister'`: ユーザーを削除する。
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
