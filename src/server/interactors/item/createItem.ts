import { createGroupMemberContextOrThrow } from '../../../models/contexts/createGroupMemberContextOrThrow.ts';
import { ItemImpl } from '../../../models/entities-impl/item/ItemImpl.ts';
import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムを作成する。
 * @param groupId アイテムの作成者のグループのID。
 * @param param 作成するアイテムの情報。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したアイテムのエンティティオブジェクト。
 */
export const createItem = async (
  groupId: IGroupProfile['id'],
  itemTypeName: IItemType['namePlural'],
  param: Pick<IItem, 'title' | 'titleForUrl' | 'publishedAt' | 'body'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IItem> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);
  const groupProfile = await implementations.groupProfileRepository.getOneByIdOrThrow(groupId);
  const type = await implementations.itemTypeRepository.getOneByNamePluralOrThrow(itemTypeName);
  const typeSummary = await implementations.itemTypeRepository.getOneSummaryByIdOrThrow(type.id);
  const owner = await implementations.groupProfileRepository.getOneSummaryByIdOrThrow(groupId);

  const context = createGroupMemberContextOrThrow(userProfile, groupMemberDirectory);

  const item = new ItemImpl({ ...param, type: typeSummary, owner }, type, groupProfile, context);

  await implementations.itemRepository.saveOne(item, true);

  return item;
};
