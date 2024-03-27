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
import type { IItemProperties } from '../item/Item.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

export interface IGroupProfileProperties {
  readonly id: IGroupProperties['id'];
  readonly name: TName;
  readonly displayName: TDisplayName;
  readonly items: readonly IItemProperties['id'][];
}

export class GroupProfile<
  Id extends IGroupProfileProperties['id'] = IGroupProfileProperties['id'],
  Name extends IGroupProfileProperties['name'] = IGroupProfileProperties['name'],
  DisplayName extends
    IGroupProfileProperties['displayName'] = IGroupProfileProperties['displayName'],
  Items extends IGroupProfileProperties['items'] = IGroupProfileProperties['items'],
> {
  public readonly id: Id;
  public readonly name: Name;
  public readonly displayName: DisplayName;
  public readonly items: Items;

  public toBodySet<
    NewName extends IGroupProfileProperties['name'],
    NewDisplayName extends IGroupProfileProperties['displayName'],
  >(param: {
    readonly name: NewName;
    readonly displayName: NewDisplayName;
    readonly groupMemberDirectory: GroupMemberDirectory<Id>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<{
    readonly groupProfile: GroupProfile<Id, NewName, NewDisplayName, Items>;
  }> {
    if (
      !param.groupMemberDirectory.members.some(
        (exists) =>
          exists.permission === 'admin' && exists.userId === param.myselfCertificate.userId,
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
        items: this.items,
        name: param.name,
        displayName: param.displayName,
      }),
    });
  }

  public static fromParam<
    Id extends IGroupProfileProperties['id'],
    Name extends IGroupProfileProperties['name'],
    DisplayName extends IGroupProfileProperties['displayName'],
    Items extends IGroupProfileProperties['items'],
  >(
    param: Pick<GroupProfile<Id, Name, DisplayName, Items>, keyof IGroupProfileProperties>,
  ): GroupProfile<Id, Name, DisplayName, Items> {
    return new GroupProfile(param);
  }

  private constructor(
    param: Pick<GroupProfile<Id, Name, DisplayName, Items>, keyof IGroupProfileProperties>,
  ) {
    this.id = param.id;
    this.name = param.name;
    this.displayName = param.displayName;
    this.items = param.items;
  }
}
