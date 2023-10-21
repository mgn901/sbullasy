import { TId } from '../../values/TId.ts';
import { TLongSecret } from '../../values/TLongSecret.ts';
import { IUser } from './IUser.ts';

/**
 * 認証用トークンを表すモデルクラス。
 */
export interface IAuthenticationToken {
  readonly __brand: 'IAuthenticationToken';

  /**
   * トークンのID。
   */
  readonly id: TId<IAuthenticationToken>;

  /**
   * トークンのシークレット値。
   */
  readonly secret: TLongSecret;

  /**
   * トークンの種類。
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
  isExpiredAt(date: Date): boolean;
}
