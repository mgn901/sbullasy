import { createInstanceAdminContextOrThrow } from '../../../models/contexts/createInstanceAdminContextOrThrow.ts';
import { ItemTypeImpl } from '../../../models/entities-impl/item-type/ItemTypeImpl.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムの種類を作成する。
 * @param param 作成するアイテムの種類の情報。
 * @param groupId 操作を行おうとしているインスタンスの管理者のグループのID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したアイテムの種類のエンティティオブジェクト。
 */
export const createItemType = async (
  param: Pick<IItemType, 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'option'>,
  groupId: IGroup['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IItemType> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const group = await implementations.groupRepository.getOneByIdOrThrow(groupId);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  const context = createInstanceAdminContextOrThrow(userProfile, group, groupMemberDirectory);

  const itemType = new ItemTypeImpl(param, context);

  await implementations.itemTypeRepository.saveOne(itemType, true);

  return itemType;
};
