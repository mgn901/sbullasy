import { IUser } from '../entities/user/IUser.ts';
import { NotSelfException } from '../errors/NotSelfException.ts';
import { ISelfContext } from './ISelfContext.ts';

/**
 * 操作しようとしているのがユーザー本人であるかを確認する。
 * @param context 操作しようとしているのがユーザー本人であることを示す情報。
 * @param userId 操作対象のユーザーのユーザーID。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotSelfException}を発生させる。
 */
export const checkSelfContext = (
  context: ISelfContext,
  userId: IUser['id'],
  messageOnError: string = 'ユーザー本人以外がこの操作を行うことはできません。',
): void => {
  const result = context.self === userId;
  if (!result) {
    throw new NotSelfException(messageOnError);
  }
};
