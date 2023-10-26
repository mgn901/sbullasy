import { IUser } from '../entities/user/IUser.ts';

/**
 * 操作を行おうとしているユーザーが、有効なプロフィールを保有していることを示す情報。
 */
export interface IValidUserProfileContext {
  readonly __brand: 'IValidUserProfileContext';

  /**
   * 操作を行おうとしているユーザーのユーザーID。
   */
  readonly userId: IUser['id'];
}
