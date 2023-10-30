import { createInstanceOperatorContextOrThrow } from '../../../models/contexts/createInstanceOperatorContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループからバッジを削除する。
 * @param groupId 操作対象のグループのID。
 * @param badgeItemId 操作対象のグループから削除するバッジのアイテムのID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param operatorGroupId 操作を行おうとしているインスタンスのオペレーターのグループID。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const addBadge = async (
  groupId: IGroup['id'],
  badgeItemId: IItem['id'],
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

  const newGroupProfile = groupProfile.setBadges(
    groupProfile.badges.filter((item) => item.id !== badgeItemId),
    context,
  );

  await implementations.groupProfileRepository.saveOne(newGroupProfile, true);
};
