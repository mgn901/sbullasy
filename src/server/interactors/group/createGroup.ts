import { createValidUserProfileContextOrThrow } from '../../../models/contexts/createValidUserProfileContextOrThrow.ts';
import { GroupMemberDirectoryImpl } from '../../../models/entities-impl/group-member-directory/GroupMemberDirectoryImpl.ts';
import { GroupProfileImpl } from '../../../models/entities-impl/group-profile/GroupProfileImpl.ts';
import { GroupImpl } from '../../../models/entities-impl/group/GroupImpl.ts';
import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループを作成する。
 * @param param 作成するグループの情報。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したグループのエンティティオブジェクト。
 */
export const createGroup = async (
  param: Pick<IGroupProfile, 'name' | 'displayName'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IGroup> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);

  const validProfileContext = createValidUserProfileContextOrThrow(userProfile);

  const group = new GroupImpl(validProfileContext, userProfile);
  const groupProfile = new GroupProfileImpl(group, param);
  const groupMemberDirectory = new GroupMemberDirectoryImpl(group, userProfile);

  await implementations.groupRepository.saveOne(group, false);
  await implementations.groupProfileRepository.saveOne(groupProfile, false);
  await implementations.groupMemberDirectoryRepository.saveOne(groupMemberDirectory, false);

  return group;
};
