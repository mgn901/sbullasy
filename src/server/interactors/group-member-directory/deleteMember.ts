import { createGroupAdminContextOrThrow } from '../../../models/contexts/createGroupAdminContextOrThrow.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループから所属ユーザーを削除する。
 * @param groupId グループのID。
 * @param userId グループから削除するユーザーのユーザーID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteMember = async (
  groupId: IGroup['id'],
  userId: IUser['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const adminUser =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const adminUserProfile = await implementations.userProfileRepository.getOneByIdOrThrow(
    adminUser.id,
  );
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  const groupAdminContext = createGroupAdminContextOrThrow(adminUserProfile, groupMemberDirectory);

  const newGroupMemberDirectory = groupMemberDirectory.deleteMember(userId, groupAdminContext);

  await implementations.groupMemberDirectoryRepository.saveOne(newGroupMemberDirectory, true);
};
