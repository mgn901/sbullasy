import { NotFoundException } from '../../../model/errors/NotFoundException.ts';
import type {
  GroupMemberDirectory,
  IGroupMemberDirectoryProperties,
} from '../../../model/group-member-directory/GroupMemberDirectory.ts';
import type { Member } from '../../../model/group-member-directory/Member.ts';
import type { GroupPermissionDirectory } from '../../../model/group-permission-directory/GroupPermissionDirectory.ts';
import type {
  GroupProfile,
  IGroupProfileProperties,
} from '../../../model/group-profile/GroupProfile.ts';
import { Group, type IGroupProperties } from '../../../model/group/Group.ts';
import type {
  DaoException,
  NotFoundOnRepositoryException,
} from '../../../model/repositories/dao-types.ts';
import type { IAuthenticationTokenProperties } from '../../../model/user-account/AuthenticationToken.ts';
import type { UserProfileExpiredException } from '../../../model/user-profile/UserProfile.ts';
import type { IUserProperties } from '../../../model/user/User.ts';
import { Failure, type TResult, isFailure } from '../../../utils/result.ts';
import type { IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import {
  type IllegalAuthenticationTokenException,
  myselfCertificateService,
} from '../../services/myselfCertificateService.ts';

export const createGroup = async <
  Name extends IGroupProfileProperties['name'],
  DisplayName extends IGroupProfileProperties['displayName'],
  UserId extends IUserProperties['id'],
  AuthenticationTokenSecret extends IAuthenticationTokenProperties['secret'],
  Id extends IGroupProperties['id'] = IGroupProperties['id'],
>(param: {
  readonly name: Name;
  readonly displayName: DisplayName;
  readonly userId: UserId;
  readonly authenticationTokenSecret: AuthenticationTokenSecret;
  readonly implementationContainer: IImplementationContainer;
}): Promise<
  TResult<
    {
      readonly group: Group<Id>;
      readonly groupMemberDirectory: GroupMemberDirectory<
        Id,
        IGroupMemberDirectoryProperties['invitationSecret'],
        readonly [Member<Id, UserId, 'admin'>]
      >;
      readonly groupPermissionDirectory: GroupPermissionDirectory<Id, 'default', readonly []>;
      readonly groupProfile: GroupProfile<Id, Name, DisplayName>;
    },
    | UserProfileExpiredException
    | IllegalAuthenticationTokenException
    | NotFoundException
    | NotFoundOnRepositoryException
    | DaoException
  >
> => {
  const myselfCertificateServiceResult = await myselfCertificateService({
    userId: param.userId,
    authenticationTokenSecret: param.authenticationTokenSecret,
    implementationContainer: param.implementationContainer,
  });
  if (myselfCertificateServiceResult instanceof Failure) {
    return myselfCertificateServiceResult;
  }

  const userProfileResult = await param.implementationContainer.userProfileRepository.getOne({
    id: param.userId,
  });
  if (userProfileResult instanceof Failure) {
    return userProfileResult;
  }
  if (userProfileResult.value.item === undefined) {
    return new Failure(
      new NotFoundException({
        message: '学生認証を受けていないユーザーがグループを作成することはできません。',
      }),
    );
  }

  const createGroupResult = Group.create<Name, DisplayName, UserId, Id>({
    name: param.name,
    displayName: param.displayName,
    userProfile: userProfileResult.value.item,
    myselfCertificate: myselfCertificateServiceResult.value.myselfCertificate,
  });
  if (createGroupResult instanceof Failure) {
    return createGroupResult;
  }

  const saveResults = await Promise.all([
    param.implementationContainer.groupRepository.save({
      item: createGroupResult.value.group,
    }),
    param.implementationContainer.groupMemberDirectoryRepository.save({
      item: createGroupResult.value.groupMemberDirectory,
    }),
    param.implementationContainer.groupPermissionDirectoryRepository.save({
      item: createGroupResult.value.groupPermissionDirectory,
    }),
    param.implementationContainer.groupProfileRepository.save({
      item: createGroupResult.value.groupProfile,
    }),
  ]);
  if (saveResults.some(isFailure)) {
    return saveResults.filter(isFailure)[0];
  }

  return createGroupResult;
};
