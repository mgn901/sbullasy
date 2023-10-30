import { createInstanceAdminContextOrThrow } from '../../../models/contexts/createInstanceAdminContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムの種類の情報を変更する。
 * @param itemTypeId 変更するアイテムの種類のID。
 * @param param 変更後の値。
 * @param groupId 操作を行おうとしているインスタンスの管理者のグループのID。
 * @param tokenSecret 操作を行おうとしているインスタンスの管理者のグループのID。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateItemType = async (
  itemTypeId: IItemType['id'],
  param: Pick<
    IItemType,
    'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options' | 'id'
  >,
  groupId: IGroup['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const group = await implementations.groupRepository.getOneByIdOrThrow(groupId);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  const context = createInstanceAdminContextOrThrow(userProfile, group, groupMemberDirectory);

  const itemType = (
    await implementations.itemTypeRepository.getOneByIdOrThrow(itemTypeId)
  ).updateItemType(param, context);

  await implementations.itemTypeRepository.saveOne(itemType, true);
};
