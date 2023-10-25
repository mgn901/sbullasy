import { createGroupMemberContextOrThrow } from '../../../models/contexts/createGroupMemberContextOrThrow.ts';
import { IGroupMemberDirectory } from '../../../models/entities/group-member-directory/IGroupMemberDirectory.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループの所属ユーザーに関する情報を持つエンティティオブジェクトを取得する。
 * @param groupId グループのID。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したグループの所属ユーザーに関する情報を持つエンティティオブジェクト。
 */
export const getGroupMemberDirectory = async (
  groupId: IGroup['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IGroupMemberDirectory> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  createGroupMemberContextOrThrow(userProfile, groupMemberDirectory);

  return groupMemberDirectory;
};
