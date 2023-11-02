import { createInstanceOperatorContextOrThrow } from '../../../models/contexts/createInstanceOperatorContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループが編集できるアイテムの種類を削除する。
 * @param groupId 操作対象のグループのID。
 * @param itemTypeId 操作対象のグループが編集できないようにするアイテムの種類のID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param operatorGroupId 操作を行おうとしているインスタンスのオペレーターのグループID。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteEditableItemType = async (
  groupId: IGroup['id'],
  itemTypeId: IItemType['id'],
  tokenSecret: TLongSecret,
  operatorGroupId: IGroup['id'],
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const operatorGroup = await implementations.groupRepository.getOneByIdOrThrow(operatorGroupId);
  const operatorGroupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(operatorGroupId);
  const groupProfile = await implementations.groupProfileRepository.getOneByIdOrThrow(groupId);

  const context = createInstanceOperatorContextOrThrow(
    userProfile,
    operatorGroup,
    operatorGroupMemberDirectory,
  );

  const newGroupProfile = groupProfile.setEditableItemTypes(
    groupProfile.editableItemTypes.filter((itemType) => itemType.id !== itemTypeId),
    context,
  );

  await implementations.groupProfileRepository.saveOne(newGroupProfile, true);
};
