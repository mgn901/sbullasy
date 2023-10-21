import { IItem } from '../entities/item/IItem.ts';
import { IItemSummary } from '../entities/item/IItemSummary.ts';
import { NotItemOwnerException } from '../errors/NotItemOwnerException.ts';
import { IItemOwnerContext } from './IItemOwnerContext.ts';

/**
 * 操作しようとしているのがアイテムの所有者の所属ユーザーであるかを確認する。
 * @param context 操作しようとしているのがアイテムの所有者の所属ユーザーであることを示す情報。
 * @param item 操作対象のアイテム。
 * @param messageOnError 確認できなかった場合{@linkcode NotItemOwnerException}を発生させる。
 */
export const checkItemOwnerContext = (
  context: IItemOwnerContext,
  item: IItem | IItemSummary,
  messageOnError: string = 'アイテムの所有者の所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): void => {
  const result =
    context.ownerMemberDirectory.id === item.owner.id &&
    context.ownerMemberDirectory.members.some((member) => context.person === member.user.id);
  if (!result) {
    throw new NotItemOwnerException(messageOnError);
  }
};
