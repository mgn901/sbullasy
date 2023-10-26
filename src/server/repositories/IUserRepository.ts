import { IUser } from '../../models/entities/user/IUser.ts';
import { TLongSecret } from '../../models/values/TLongSecret.ts';
import { IRepositoryGetManyOptions } from './IRepositoryGetManyOptions.ts';

/**
 * {@linkcode IUser}のリポジトリ。
 */
export interface IUserRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param userId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(userId: IUser['id']): Promise<IUser>;

  /**
   * 指定したEメールアドレスを持つユーザーを1件取得する。
   * @param userEmail 取得するユーザーのEメールアドレス。
   */
  getOneByEmailOrThrow(userEmail: IUser['email']): Promise<IUser>;

  /**
   * 指定したトークンのシークレット値と関連付けられているユーザーを1件取得する。
   * 関連付けられているユーザーがいなかった場合は例外を発生させる。
   * @param authenticationTokenSecret 取得するユーザーと関連付けられているトークンのシークレット値。
   */
  getOneByAuthenticationTokenSecretOrThrow(authenticationTokenSecret: TLongSecret): Promise<IUser>;

  /**
   * 指定した条件でオブジェクトを複数件取得する。
   * @param options 取得時の挙動の設定。
   */
  getMany(
    options: IRepositoryGetManyOptions<'id_asc' | 'email_asc', IUser['id']>,
  ): Promise<IUser[]>;

  /**
   * オブジェクトを永続化する。
   * @param user 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(user: IUser, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param userId 削除するオブジェクトのID。
   */
  deleteOneById(userId: IUser['id']): Promise<void>;
}
