import type { GroupProfile } from '../group-profile/GroupProfile.ts';
import type { IMemberProperties } from './Member.ts';

const memberWithGroupProfileTypeSymbol = Symbol('memberWithGroupProfileTypeSymbol');

export interface IMemberWithGroupProfileProperties {
  readonly groupProfile: GroupProfile<IMemberProperties['groupId']>;
  readonly userId: IMemberProperties['userId'];
  readonly role: IMemberProperties['role'];
}

export class MemberWithGroupProfile<
  GroupProfileObj extends
    IMemberWithGroupProfileProperties['groupProfile'] = IMemberWithGroupProfileProperties['groupProfile'],
  UserId extends
    IMemberWithGroupProfileProperties['userId'] = IMemberWithGroupProfileProperties['userId'],
  Role extends
    IMemberWithGroupProfileProperties['role'] = IMemberWithGroupProfileProperties['role'],
> {
  public readonly [memberWithGroupProfileTypeSymbol]: unknown;
  public readonly groupProfile: GroupProfileObj;
  public readonly userId: UserId;
  public readonly role: Role;

  public static fromParam<
    GroupProfileObj extends IMemberWithGroupProfileProperties['groupProfile'],
    UserId extends IMemberWithGroupProfileProperties['userId'],
    Role extends IMemberWithGroupProfileProperties['role'],
  >(
    param: Pick<
      MemberWithGroupProfile<GroupProfileObj, UserId, Role>,
      keyof IMemberWithGroupProfileProperties
    >,
  ): MemberWithGroupProfile<GroupProfileObj, UserId, Role> {
    return new MemberWithGroupProfile(param);
  }

  private constructor(
    param: Pick<
      MemberWithGroupProfile<GroupProfileObj, UserId, Role>,
      keyof IMemberWithGroupProfileProperties
    >,
  ) {
    this.groupProfile = param.groupProfile;
    this.userId = param.userId;
    this.role = param.role;
  }
}
