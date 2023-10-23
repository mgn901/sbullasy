import { IGroupMemberDirectory } from '../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IItem } from '../entities/item/IItem.ts';
import { IItemSummary } from '../entities/item/IItemSummary.ts';
import { IUserProfile } from '../entities/user-profile/IUserProfile.ts';
import { NotItemOwnerException } from '../errors/NotItemOwnerException.ts';
import { IItemOwnerContext } from './IItemOwnerContext.ts';

/**
 * 操作しようとしているユーザーが、操作対象のアイテムの所有者の所属ユーザーであることを確認し、それを示す情報を返す。
 * 確認できなかった場合は例外を発生させる。
 * @param userProfile 操作しようとしているユーザーのプロフィールの情報を持つエンティティオブジェクト。
 * @param item 操作対象のアイテムのエンティティオブジェクト。
 * @param itemOwnerMemberDirectory 操作対象のアイテムの所有者の所属ユーザーの情報を持つエンティティオブジェクト。
 * @param messageOnError エラー発生時のメッセージ。
 * @returns 操作しようとしているユーザーが、操作対象のアイテムの所有者の所属ユーザーであることを示す情報。
 * @throws 操作しようとしているユーザーが、操作対象のアイテムの所有者の所属ユーザーではなかった場合、{@linkcode NotItemOwnerException}を発生させる。
 */
export const createItemOwnerContextOrThrow = (
  userProfile: IUserProfile,
  item: IItem | IItemSummary,
  itemOwnerMemberDirectory: IGroupMemberDirectory,
  messageOnError: string = 'アイテムの所有者の所属ユーザー以外のユーザーがこの操作を行うことはできません。',
): IItemOwnerContext => {
  const now = new Date();

  const checkResult =
    userProfile.isValidAt(now) &&
    item.owner.id === itemOwnerMemberDirectory.id &&
    itemOwnerMemberDirectory.members.find((member) => member.user.id === userProfile.id);

  if (!checkResult) {
    throw new NotItemOwnerException(messageOnError);
  }

  return {
    __brand: 'IItemOwnerContext',
    itemId: item.id,
  };
};
