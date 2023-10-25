import { createItemOwnerContextOrThrow } from '../../../models/contexts/createItemOwnerContextOrThrow.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムの情報を変更する。
 * @param itemId アイテムのID。
 * @param param 変更後の値。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateItem = async (
  itemId: IItem['id'],
  param: Pick<IItem, 'displayName' | 'publishedAt' | 'body'>,
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

  item.updateItem(param, context);

  await implementations.itemRepository.saveOne(item, true);
};
