import { extract } from '../../utils/predicate.ts';
import type { TNominalPrimitive } from '../../utils/primitive.ts';
import { type TId, generateId } from '../../utils/random-values/id.ts';
import { generateShortSecret } from '../../utils/random-values/short-secret.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import {
  GroupMemberDirectory,
  type IGroupMemberDirectoryProperties,
  NotGroupMemberException,
} from '../group-member-directory/GroupMemberDirectory.ts';
import { Member } from '../group-member-directory/Member.ts';
import { GroupPermissionDirectory } from '../group-permission-directory/GroupPermissionDirectory.ts';
import { GroupProfile, type IGroupProfileProperties } from '../group-profile/GroupProfile.ts';
import type { IGroupMemberDirectoryRepositoryDeleteOneParams } from '../repositories/IGroupMemberDirectoryRepository.ts';
import type { IGroupPermissionDirectoryRepositoryDeleteOneParams } from '../repositories/IGroupPermissionDirectoryRepository.ts';
import type { IGroupProfileRepositoryDeleteOneParams } from '../repositories/IGroupProfileRepository.ts';
import type {
  IGroupRepositoryDeleteOneParams,
  IGroupRepositoryGetOneByIdParams,
} from '../repositories/IGroupRepository.ts';
import type { IItemRepositoryDeleteManyParams } from '../repositories/IItemRepository.ts';
import { type UserProfile, UserProfileExpiredException } from '../user-profile/UserProfile.ts';
import type { IUserProperties } from '../user/User.ts';

const groupTypeSymbol = Symbol('groupTypeSymbol');

export interface IGroupProperties {
  readonly id: TNominalPrimitive<TId, typeof groupTypeSymbol>;
  readonly createdAt: Date;
}

export class Group<
  Id extends IGroupProperties['id'] = IGroupProperties['id'],
  CreatedAt extends IGroupProperties['createdAt'] = IGroupProperties['createdAt'],
> {
  public readonly [groupTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly createdAt: CreatedAt;

  public static create<
    Name extends IGroupProfileProperties['name'],
    DisplayName extends IGroupProfileProperties['displayName'],
    UserId extends IUserProperties['id'],
    Id extends IGroupProperties['id'] = IGroupProperties['id'],
  >(param: {
    readonly name: Name;
    readonly displayName: DisplayName;
    readonly userProfile: UserProfile<UserId>;
    readonly myselfCertificate: MyselfCertificate<UserId>;
  }): TResult<
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
    UserProfileExpiredException
  > {
    const id = generateId() as Id;

    if (!param.userProfile.isValidAt({}).value.isValid) {
      return new Failure(
        new UserProfileExpiredException({
          message:
            '学生認証の期限が切れています。グループを作成する前に、再度学生認証を受けてください。',
        }),
      );
    }

    return new Success({
      group: Group.fromParam({
        id,
        createdAt: new Date(),
      }),
      groupMemberDirectory: GroupMemberDirectory.fromParam({
        id,
        invitationSecret: generateShortSecret(),
        members: [
          Member.fromParam({
            groupId: id,
            userId: param.userProfile.id,
            role: 'admin',
          }),
        ] as const,
      }),
      groupPermissionDirectory: GroupPermissionDirectory.fromParam({
        id,
        roleInInstance: 'default',
        allowedToModify: [] as const,
      }),
      groupProfile: GroupProfile.fromParam({
        id,
        name: param.name,
        displayName: param.displayName,
      }),
    });
  }

  public static createGetByIdRequest<Id extends IGroupProperties['id']>(param: {
    readonly id: Id;
  }): Success<{
    readonly daoRequest: IGroupRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public createDeleteRequest(param: {
    readonly groupMemberDirectory: GroupMemberDirectory<Id>;
    readonly myselfCertificate: MyselfCertificate<IUserProperties['id']>;
  }): TResult<
    {
      readonly daoRequests: readonly [
        IItemRepositoryDeleteManyParams,
        IGroupMemberDirectoryRepositoryDeleteOneParams<Id>,
        IGroupPermissionDirectoryRepositoryDeleteOneParams<Id>,
        IGroupProfileRepositoryDeleteOneParams<Id>,
        IGroupRepositoryDeleteOneParams<Id>,
      ];
    },
    NotGroupMemberException
  > {
    if (
      !param.groupMemberDirectory.members.some(
        extract({ userId: param.myselfCertificate.userId, role: 'admin' }),
      )
    ) {
      return new Failure(
        new NotGroupMemberException({
          message: 'グループの管理者以外のユーザーがグループを削除することはできません。',
        }),
      );
    }

    return new Success({
      daoRequests: [
        { query: { createdBy: this.id } },
        { id: this.id },
        { id: this.id },
        { id: this.id },
        { id: this.id },
      ] as const,
    });
  }

  public static fromParam<
    Id extends IGroupProperties['id'],
    CreatedAt extends IGroupProperties['createdAt'],
  >(param: Pick<Group<Id, CreatedAt>, keyof IGroupProperties>): Group<Id, CreatedAt> {
    return new Group(param);
  }

  private constructor(param: Pick<Group<Id, CreatedAt>, keyof IGroupProperties>) {
    this.id = param.id;
    this.createdAt = param.createdAt;
  }
}
