import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { createValidUserProfileContextOrThrow } from '../../../models/contexts/createValidUserProfileContextOrThrow.ts';
import { IGroupMemberDirectory } from '../../../models/entities/group-member-directory/IGroupMemberDirectory.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 招待コードを使用してグループに参加する。
 * @param invitationCode 使用する招待コード。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const addMemberByInvitationCode = async (
  invitationCode: IGroupMemberDirectory['invitationCode'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userProfile = await implementations.userProfileRepository.getOneByIdOrThrow(user.id);
  const groupMemberDirectory =
    await implementations.groupMemberDirectoryRepository.getOneByInvitationCodeOrThrow(
      invitationCode,
    );

  const selfContext = createSelfContextOrThrow(user);
  const validUserProfileContext = createValidUserProfileContextOrThrow(userProfile);

  groupMemberDirectory.joinByInvitationCode(
    userProfile,
    invitationCode,
    selfContext,
    validUserProfileContext,
  );

  await implementations.groupMemberDirectoryRepository.saveOne(groupMemberDirectory, true);
};
