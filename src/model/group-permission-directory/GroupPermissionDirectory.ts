import { Failure, Success, type TResult } from '../../utils/result.ts';
import type {
  IMyselfCertificateProperties,
  MyselfCertificate,
} from '../certificates/MyselfCertificate.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import type { GroupMemberDirectory } from '../group-member-directory/GroupMemberDirectory.ts';
import { NotGroupMemberException } from '../group-member-directory/GroupMemberDirectory.ts';
import type { IGroupProperties } from '../group/Group.ts';
import type { IGroupPermissionDirectoryRepositoryGetOneByIdParams } from '../repositories/IGroupPermissionDirectoryRepository.ts';
import type { ITemplateProperties } from '../template/Template.ts';

const groupPermissionDirectoryTypeSymbol = Symbol('groupPermissionDirectoryTypeSymbol');

export interface IGroupPermissionDirectoryProperties {
  readonly id: IGroupProperties['id'];
  readonly roleInInstance: 'admin' | 'moderator' | 'default';
  readonly allowedToModify: readonly ITemplateProperties['id'][];
}

export class GroupPermissionDirectory<
  Id extends IGroupPermissionDirectoryProperties['id'] = IGroupPermissionDirectoryProperties['id'],
  RoleInInstance extends
    IGroupPermissionDirectoryProperties['roleInInstance'] = IGroupPermissionDirectoryProperties['roleInInstance'],
  AllowedToModify extends
    IGroupPermissionDirectoryProperties['allowedToModify'] = IGroupPermissionDirectoryProperties['allowedToModify'],
> {
  public readonly [groupPermissionDirectoryTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly roleInInstance: RoleInInstance;
  public readonly allowedToModify: AllowedToModify;

  public static createGetByIdRequest<Id extends IGroupPermissionDirectoryProperties['id']>(param: {
    readonly id: Id;
  }): Success<{
    readonly daoRequest: IGroupPermissionDirectoryRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public toBodySet<
    NewRoleInInstance extends IGroupPermissionDirectoryProperties['roleInInstance'],
    NewAllowedToModify extends IGroupPermissionDirectoryProperties['allowedToModify'],
    InstanceAdminGroupId extends IGroupProperties['id'] = IGroupProperties['id'],
  >(param: {
    readonly roleInInstance: NewRoleInInstance;
    readonly allowedToModify: NewAllowedToModify;
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminGroupId,
      'admin'
    >;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminGroupId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly groupPermissionDirectory: GroupPermissionDirectory<
        Id,
        NewRoleInInstance,
        NewAllowedToModify
      >;
    },
    NotGroupMemberException
  > {
    if (
      !param.instanceAdminGroupMemberDirectory.members.some(
        (exists) => exists.userId === param.myselfCertificate.userId,
      )
    ) {
      return new Failure(
        new NotGroupMemberException({
          message:
            'インスタンス管理グループのメンバー以外が、グループの権限を変更することはできません。',
        }),
      );
    }

    return new Success({
      groupPermissionDirectory: GroupPermissionDirectory.fromParam({
        id: this.id,
        roleInInstance: param.roleInInstance,
        allowedToModify: param.allowedToModify,
      }),
    });
  }

  public static fromParam<
    Id extends IGroupPermissionDirectoryProperties['id'],
    RoleInInstance extends IGroupPermissionDirectoryProperties['roleInInstance'],
    AllowedToModify extends IGroupPermissionDirectoryProperties['allowedToModify'],
  >(
    param: Pick<
      GroupPermissionDirectory<Id, RoleInInstance, AllowedToModify>,
      keyof IGroupPermissionDirectoryProperties
    >,
  ): GroupPermissionDirectory<Id, RoleInInstance, AllowedToModify> {
    return new GroupPermissionDirectory(param);
  }

  private constructor(
    param: Pick<
      GroupPermissionDirectory<Id, RoleInInstance, AllowedToModify>,
      keyof IGroupPermissionDirectoryProperties
    >,
  ) {
    this.id = param.id;
    this.roleInInstance = param.roleInInstance;
    this.allowedToModify = param.allowedToModify;
  }
}

export class NotInstanceAdminException extends ApplicationErrorOrException {
  public readonly name = 'NotInstanceAdminException';
}

export class NotAllowedToModifyException extends ApplicationErrorOrException {
  public readonly name = 'NotAllowedToModifyException';
}
