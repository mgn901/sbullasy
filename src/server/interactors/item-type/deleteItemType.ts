import { createInstanceAdminContextOrThrow } from '../../../models/contexts/createInstanceAdminContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムの種類を削除する。
 * @param itemTypeId 削除するアイテムの種類のID。
 * @param groupId 操作しようとしているインスタンスの管理者のグループのID。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteItemType = async (
  itemTypeId: IItemType['id'],
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

  createInstanceAdminContextOrThrow(userProfile, group, groupMemberDirectory);

  await implementations.itemTypeRepository.deleteOneById(itemTypeId);
};
