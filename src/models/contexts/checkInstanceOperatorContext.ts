import { NotInstanceOperatorException } from '../errors/NotInstanceOperatorException.ts';
import { IInstanceOperatorContext } from './IInstanceOperatorContext.ts';

/**
 * 操作しようとしているのがインスタンスのオペレーターの所属ユーザーであるかを確認する。
 * @param context 操作しようとしているのがインスタンスのオペレーターの所属ユーザーであることを示す情報。
 * @param messageOnError エラー発生時のメッセージ。
 * @throws 確認できなかった場合{@linkcode NotInstanceOperatorException}を発生させる。
 */
export const checkInstanceOperatorContext = (
  context: IInstanceOperatorContext,
  messageOnError: string = 'インスタンスのオペレーターの所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.operator.instanceRole === 'operator' &&
    context.operatorMemberDirectory.members.some((member) => context.person === member.user.id);
  if (!result) {
    throw new NotInstanceOperatorException(messageOnError);
  }
};
