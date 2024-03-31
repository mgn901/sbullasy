import type { UserProfile } from '../user-profile/UserProfile.ts';
import type { IMemberProperties } from './Member.ts';

const memberWithUserProfileTypeSymbol = Symbol('memberWithUserProfileTypeSymbol');

export interface IMemberWithUserProfileProperties {
  readonly groupId: IMemberProperties['groupId'];
  readonly userProfile: UserProfile<IMemberProperties['userId']>;
  readonly role: IMemberProperties['role'];
}

export class MemberWithUserProfile<
  GroupId extends
    IMemberWithUserProfileProperties['groupId'] = IMemberWithUserProfileProperties['groupId'],
  UserProfileObj extends
    IMemberWithUserProfileProperties['userProfile'] = IMemberWithUserProfileProperties['userProfile'],
  Role extends IMemberWithUserProfileProperties['role'] = IMemberWithUserProfileProperties['role'],
> {
  public readonly [memberWithUserProfileTypeSymbol]: unknown;
  public readonly groupId: GroupId;
  public readonly userProfile: UserProfileObj;
  public readonly role: Role;

  public static fromParam<
    GroupId extends IMemberWithUserProfileProperties['groupId'],
    UserProfileObj extends IMemberWithUserProfileProperties['userProfile'],
    Role extends IMemberWithUserProfileProperties['role'],
  >(
    param: Pick<
      MemberWithUserProfile<GroupId, UserProfileObj, Role>,
      keyof IMemberWithUserProfileProperties
    >,
  ): MemberWithUserProfile<GroupId, UserProfileObj, Role> {
    return new MemberWithUserProfile(param);
  }

  private constructor(
    param: Pick<
      MemberWithUserProfile<GroupId, UserProfileObj, Role>,
      keyof IMemberWithUserProfileProperties
    >,
  ) {
    this.groupId = param.groupId;
    this.userProfile = param.userProfile;
    this.role = param.role;
  }
}
