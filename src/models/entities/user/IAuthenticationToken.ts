import { TId } from '../../values/TId.ts';
import { TLongSecret } from '../../values/TLongSecret.ts';
import { IUser } from './IUser.ts';

/**
 * 認証用トークンを表すモデルクラス。
 *
 * スバラシには、特定のユーザーでないと行えない操作が存在する。
 * 認証用トークンは、メール認証などの本人確認を伴う方法によって作成されるものであり、
 * 認証を要する操作を行う際に、トークンを識別するためのシークレット値をクライアントに添付させることで、
 * 操作を行おうとしているユーザーを識別する。
 */
export interface IAuthenticationToken {
  readonly __brand: 'IAuthenticationToken';

  /**
   * トークンのID。
   */
  readonly id: TId<IAuthenticationToken>;

  /**
   * トークンの種類。
   * - `'cookie'`: Cookieに用いることができるトークン。
   * - `'Bearer Token'`: Bearer Tokenとして用いることができるトークン。
   */
  readonly type: 'bearer' | 'cookie';

  /**
   * トークンの作成日時。
   */
  readonly createdAt: Date;

  /**
   * トークンの有効期限。
   */
  readonly expiresAt: Date;

  /**
   * トークンを作成したクライアントのIPアドレス。
   */
  readonly ipAddress: string;

  /**
   * トークンを作成したクライアントのユーザーエージェント。
   */
  readonly userAgent: string;

  /**
   * トークンを保有しているユーザーのID。
   */
  readonly ownerId: IUser['id'];

  /**
   * 指定した日時においてトークンが有効であるか。
   * @param date 日時の指定。この日時においてトークンが有効であるかを返す。
   */
  isValidAt(date: Date): boolean;

  /**
   * トークンのシークレット値を取得する。
   * このメソッドはリポジトリ等の実装のために用いるものであり、ビジネスロジックの中で用いてはならない。
   */
  dangerouslyGetSecret(): TLongSecret;
}
