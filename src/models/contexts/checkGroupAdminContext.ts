import { IGroup } from '../entities/group/IGroup.ts';
import { NotGroupAdminException } from '../errors/NotGroupAdminException.ts';
import { IGroupAdminContext } from './IGroupAdminContext.ts';

/**
 * 操作しようとしているのがグループの管理者であるかを確認する。
 * @param context 操作しようとしているのがグループの管理者であることを示す情報。
 * @param groupId 操作対象のグループのグループID。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotGroupAdminException}を発生させる。
 */
export const checkGroupAdminContext = (
  context: IGroupAdminContext,
  groupId: IGroup['id'],
  messageOnError: string = 'グループの管理者以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.groupMemberDirectory.id === groupId &&
    context.groupMemberDirectory.members.some(
      (member) => context.admin === member.user.id && member.type === 'admin',
    );
  if (!result) {
    throw new NotGroupAdminException(messageOnError);
  }
};
