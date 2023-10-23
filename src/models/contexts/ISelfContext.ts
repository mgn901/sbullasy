import { IUser } from '../entities/user/IUser.ts';

/**
 * 操作しようとしているのが、操作対象のユーザー本人であることを示す情報。
 */
export interface ISelfContext {
  readonly __brand: 'ISelfContext';

  /**
   * 操作対象のユーザーのユーザーID。
   */
  readonly userId: IUser['id'];
}
