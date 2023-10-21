import { IGroup } from '../entities/group/IGroup.ts';
import { NotGroupMemberException } from '../errors/NotGroupMemberException.ts';
import { IGroupMemberContext } from './IGroupMemberContext.ts';

/**
 * 操作しようとしているのがグループのメンバーであることを確認する。
 * @param context 操作しようとしているのがグループのメンバーであることを示す情報。
 * @param groupId 操作対象のグループのグループID。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotGroupMemberException}を発生させる。
 */
export const checkGroupMemberContext = (
  context: IGroupMemberContext,
  groupId: IGroup['id'],
  messageOnError: string = 'グループの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.groupMemberDirectory.id === groupId &&
    context.groupMemberDirectory.members.some((member) => context.member === member.user.id);
  if (!result) {
    throw new NotGroupMemberException(messageOnError);
  }
};
