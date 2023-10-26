import { createGroupAdminContextOrThrow } from '../../../models/contexts/createGroupAdminContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループを削除する。
 * @param groupId 削除するグループのID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteGroup = async (
  groupId: IGroup['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  createGroupAdminContextOrThrow(userProfile, groupMemberDirectory);

  await implementations.groupProfileRepository.deleteOneById(groupId);
  await implementations.groupMemberDirectoryRepository.deleteOneById(groupId);
  await implementations.groupRepository.deleteOneById(groupId);
};
