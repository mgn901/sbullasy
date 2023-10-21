import { NotInstanceModeratorException } from '../errors/NotInstanceModeratorException.ts';
import { IInstanceModeratorContext } from './IInstanceModeratorContext.ts';

/**
 * 操作しようとしているのがインスタンスのモデレーターの所属ユーザーであるかを確認する。
 * @param context 操作しようとしているのがインスタンスのモデレーターの所属ユーザーであることを示す情報。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotInstanceModeratorException}を発生させる。
 */
export const checkInstanceModeratorContext = (
  context: IInstanceModeratorContext,
  messageOnError: string = 'インスタンスのモデレーターの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.moderator.instanceRole === 'moderator' &&
    context.moderatorMemberDirectory.members.some((member) => context.person === member.user.id);
  if (!result) {
    throw new NotInstanceModeratorException(messageOnError);
  }
};
