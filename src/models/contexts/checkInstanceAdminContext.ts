import { NotInstanceAdminException } from '../errors/NotInstanceAdminException.ts';
import { IInstanceAdminContext } from './IInstanceAdminContext.ts';

/**
 * 操作しようとしているのがインスタンスの管理者の所属ユーザーであるかを確認する。
 * @param context 操作しようとしているのがインスタンスの管理者の所属ユーザーであることを示す情報。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotInstanceAdminException}を発生させる。
 */
export const checkInstanceAdminContext = (
  context: IInstanceAdminContext,
  messageOnError: string = 'インスタンスの管理者の所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.admin.instanceRole === 'admin' &&
    context.adminMemberDirectory.members.some((member) => context.person === member.user.id);
  if (!result) {
    throw new NotInstanceAdminException(messageOnError);
  }
};
