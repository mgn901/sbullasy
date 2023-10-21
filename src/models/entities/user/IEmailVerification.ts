import { TEmail } from '../../values/TEmail.ts';
import { TId } from '../../values/TId.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IUser } from './IUser.ts';

/**
 * メールアドレス認証を表すエンティティクラス。
 */
export interface IEmailVerification {
  readonly __brand: 'IEmailVerification';

  /**
   * メールアドレス認証のID。
   */
  readonly id: TId<IEmailVerification>;

  /**
   * メールアドレス認証のシークレット値。
   */
  readonly secret: TShortSecret;

  /**
   * メールアドレス認証の作成日時。
   */
  readonly createdAt: Date;

  /**
   * メールアドレス認証の有効期限。
   */
  readonly expiresAt: Date;

  /**
   * メールアドレス認証の目的。
   * - `'cookieToken'`: クッキーとして用いるトークンを
   */
  readonly for: 'cookieToken' | 'bearerToken' | 'setProfileExpiresAt' | 'unregister';

  /**
   * メールアドレス認証のシークレット値の送信先。
   */
  readonly email: TEmail;

  /**
   * メールアドレス認証しようとしているユーザー。
   */
  readonly userId: IUser['id'];

  /**
   * ある日時においてメールアドレス認証が有効であるかどうか。
   * @param date 日時の指定。この日時においてメールアドレス認証が有効であるかどうかを返す。
   */
  isExpiredAt(date: Date): boolean;
}
