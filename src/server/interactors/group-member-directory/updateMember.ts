import { createGroupAdminContextOrThrow } from '../../../models/contexts/createGroupAdminContextOrThrow.ts';
import { IMember } from '../../../models/entities/group-member-directory/IMember.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { NotFoundException } from '../../../models/errors/NotFoundException.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 所属ユーザーのグループとの関係を変更する。
 * @param groupId グループのID。
 * @param userId 変更対象の所属ユーザーのユーザーID。
 * @param type 変更後の値
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateMember = async (
  groupId: IGroup['id'],
  userId: IUser['id'],
  type: IMember['type'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const adminUser =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const adminUserProfile = await implementations.userProfileRepository.getOneByIdOrThrow(
    adminUser.id,
  );
  const targetUserProfile = await implementations.userProfileRepository.getOneByIdOrThrow(userId);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);
  const member = groupMemberDirectory.members.find((m) => m.user.id === userId);
  if (!member) {
    throw new NotFoundException();
  }

  const groupAdminContext = createGroupAdminContextOrThrow(adminUserProfile, groupMemberDirectory);

  groupMemberDirectory.updateMember(targetUserProfile, type, groupAdminContext);

  await implementations.groupMemberDirectoryRepository.saveOne(groupMemberDirectory, true);
};
