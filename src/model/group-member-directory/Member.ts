import type { IGroupProperties } from '../group/Group.ts';
import type { IUserProperties } from '../user/User.ts';

const memberTypeSymbol = Symbol('memberTypeSymbol');

export interface IMemberProperties {
  readonly groupId: IGroupProperties['id'];
  readonly userId: IUserProperties['id'];
  readonly permission: 'admin' | 'default';
}

export class Member<
  GroupId extends IMemberProperties['groupId'] = IMemberProperties['groupId'],
  UserId extends IMemberProperties['userId'] = IMemberProperties['userId'],
  Permission extends IMemberProperties['permission'] = IMemberProperties['permission'],
> {
  public readonly [memberTypeSymbol]: unknown;
  public readonly groupId: GroupId;
  public readonly userId: UserId;
  public readonly permission: Permission;

  public static fromParam<
    GroupId extends IMemberProperties['groupId'],
    UserId extends IMemberProperties['userId'],
    Permission extends IMemberProperties['permission'],
  >(
    param: Pick<Member<GroupId, UserId, Permission>, keyof IMemberProperties>,
  ): Member<GroupId, UserId, Permission> {
    return new Member(param);
  }

  private constructor(param: Pick<Member<GroupId, UserId, Permission>, keyof IMemberProperties>) {
    this.groupId = param.groupId;
    this.userId = param.userId;
    this.permission = param.permission;
  }
}
