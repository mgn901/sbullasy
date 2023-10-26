import { IUser } from '../entities/user/IUser.ts';
import { ISelfContext } from './ISelfContext.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のユーザー本人であることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param user 操作対象のユーザーのエンティティオブジェクト。
 * @returns 操作を行おうとしているユーザーが、操作対象のユーザー本人であることを示す情報。
 */
export const createSelfContextOrThrow = (user: IUser): ISelfContext => ({
  __brand: 'ISelfContext',
  userId: user.id,
});
