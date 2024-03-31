import type { IGroupProperties } from '../group/Group.ts';
import type { IUserProperties } from '../user/User.ts';

const memberTypeSymbol = Symbol('memberTypeSymbol');

export interface IMemberProperties {
  readonly groupId: IGroupProperties['id'];
  readonly userId: IUserProperties['id'];
  readonly role: 'admin' | 'default';
}

export class Member<
  GroupId extends IMemberProperties['groupId'] = IMemberProperties['groupId'],
  UserId extends IMemberProperties['userId'] = IMemberProperties['userId'],
  Role extends IMemberProperties['role'] = IMemberProperties['role'],
> {
  public readonly [memberTypeSymbol]: unknown;
  public readonly groupId: GroupId;
  public readonly userId: UserId;
  public readonly role: Role;

  public static fromParam<
    GroupId extends IMemberProperties['groupId'],
    UserId extends IMemberProperties['userId'],
    Role extends IMemberProperties['role'],
  >(
    param: Pick<Member<GroupId, UserId, Role>, keyof IMemberProperties>,
  ): Member<GroupId, UserId, Role> {
    return new Member(param);
  }

  private constructor(param: Pick<Member<GroupId, UserId, Role>, keyof IMemberProperties>) {
    this.groupId = param.groupId;
    this.userId = param.userId;
    this.role = param.role;
  }
}
