import { createItemOwnerContextOrThrow } from '../../../models/contexts/createItemOwnerContextOrThrow.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムを削除する。
 * @param itemId 削除するアイテムのID。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteItem = async (
  itemId: IItem['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const item = await implementations.itemRepository.getOneByIdOrThrow(itemId);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(item.owner.id);

  const context = createItemOwnerContextOrThrow(userProfile, item, groupMemberDirectory);

  item.validateItemOwnerContextOrThrow(context);
  await implementations.itemRepository.deleteOneById(itemId);
};
