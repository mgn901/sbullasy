import { IUser } from '../entities/user/IUser.ts';

/**
 * 操作しようとしているユーザーが、有効なプロフィールを保有していることを示す情報。
 */
export interface IValidUserProfileContext {
  readonly __brand: 'IValidUserProfileContext';

  /**
   * 操作しようとしているユーザーのユーザーID。
   */
  readonly userId: IUser['id'];
}
