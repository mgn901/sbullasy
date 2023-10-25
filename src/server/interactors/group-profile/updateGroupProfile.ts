import { createGroupAdminContextOrThrow } from '../../../models/contexts/createGroupAdminContextOrThrow.ts';
import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループのプロフィールを変更する。
 * @param groupId グループのID。
 * @param param 変更後の値。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const updateGroupProfile = async (
  groupId: IGroupProfile['id'],
  param: Pick<IGroupProfile, 'name' | 'displayName'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
) => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const groupProfile = await implementations.groupProfileRepository.getOneByIdOrThrow(groupId);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByIdOrThrow(groupId);

  const context = createGroupAdminContextOrThrow(userProfile, groupMemberDirectory);

  groupProfile.updateGroupProfile(param, context);

  await implementations.groupProfileRepository.saveOne(groupProfile, true);
};
