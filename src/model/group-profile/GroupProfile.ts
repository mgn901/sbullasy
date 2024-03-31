import { Failure, Success, type TResult } from '../../utils/result.ts';
import type {
  IMyselfCertificateProperties,
  MyselfCertificate,
} from '../certificates/MyselfCertificate.ts';
import {
  type GroupMemberDirectory,
  NotGroupAdminException,
} from '../group-member-directory/GroupMemberDirectory.ts';
import type { IGroupProperties } from '../group/Group.ts';
import type { Item } from '../item/Item.ts';
import type {
  IGroupProfileRepositoryGetManyParams,
  IGroupProfileRepositoryGetOneByIdParams,
} from '../repositories/IGroupProfileRepository.ts';
import type { IItemRepositoryGetManyParams } from '../repositories/IItemRepository.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

const groupProfileTypeSymbol = Symbol('groupProfileTypeSymbol');

export interface IGroupProfileProperties {
  readonly id: IGroupProperties['id'];
  readonly name: TName;
  readonly displayName: TDisplayName;
}

export class GroupProfile<
  Id extends IGroupProfileProperties['id'] = IGroupProfileProperties['id'],
  Name extends IGroupProfileProperties['name'] = IGroupProfileProperties['name'],
  DisplayName extends
    IGroupProfileProperties['displayName'] = IGroupProfileProperties['displayName'],
> {
  public readonly [groupProfileTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly name: Name;
  public readonly displayName: DisplayName;

  public static createGetByIdRequest<Id extends IGroupProfileProperties['id']>(param: {
    readonly id: Id;
  }): Success<{
    readonly daoRequest: IGroupProfileRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public static createGetManyRequest(param: {
    readonly options?: IGroupProfileRepositoryGetManyParams<
      GroupProfile,
      Record<never, never>
    >['options'];
  }): Success<{
    readonly daoRequest: IGroupProfileRepositoryGetManyParams<GroupProfile, Record<never, never>>;
  }> {
    return new Success({
      daoRequest: {
        query: {},
        options: param.options,
      },
    });
  }

  public createGetItemsRequest(param: {
    readonly options?: IItemRepositoryGetManyParams<Item, { readonly createdBy: Id }>['options'];
  }): Success<{
    readonly daoRequest: IItemRepositoryGetManyParams<Item, { readonly createdBy: Id }>;
  }> {
    return new Success({
      daoRequest: {
        query: { createdBy: this.id },
        options: param.options,
      },
    });
  }

  public toBodySet<
    NewName extends IGroupProfileProperties['name'],
    NewDisplayName extends IGroupProfileProperties['displayName'],
  >(param: {
    readonly name: NewName;
    readonly displayName: NewDisplayName;
    readonly groupMemberDirectory: GroupMemberDirectory<Id>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly groupProfile: GroupProfile<Id, NewName, NewDisplayName>;
    },
    NotGroupAdminException
  > {
    if (
      !param.groupMemberDirectory.members.some(
        (exists) => exists.role === 'admin' && exists.userId === param.myselfCertificate.userId,
      )
    ) {
      return new Failure(
        new NotGroupAdminException({
          message: '管理者以外のメンバーがグループのプロフィールを変更することはできません。',
        }),
      );
    }

    return new Success({
      groupProfile: GroupProfile.fromParam({
        id: this.id,
        name: param.name,
        displayName: param.displayName,
      }),
    });
  }

  public static fromParam<
    Id extends IGroupProfileProperties['id'],
    Name extends IGroupProfileProperties['name'],
    DisplayName extends IGroupProfileProperties['displayName'],
  >(
    param: Pick<GroupProfile<Id, Name, DisplayName>, keyof IGroupProfileProperties>,
  ): GroupProfile<Id, Name, DisplayName> {
    return new GroupProfile(param);
  }

  private constructor(
    param: Pick<GroupProfile<Id, Name, DisplayName>, keyof IGroupProfileProperties>,
  ) {
    this.id = param.id;
    this.name = param.name;
    this.displayName = param.displayName;
  }
}
