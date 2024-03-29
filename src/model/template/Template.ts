import { extract } from '../../utils/predicate.ts';
import type { TNominalPrimitive } from '../../utils/primitive.ts';
import { type TId, generateId } from '../../utils/random-values/id.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type {
  IMyselfCertificateProperties,
  MyselfCertificate,
} from '../certificates/MyselfCertificate.ts';
import {
  type GroupMemberDirectory,
  NotGroupMemberException,
} from '../group-member-directory/GroupMemberDirectory.ts';
import type { GroupPermissionDirectory } from '../group-permission-directory/GroupPermissionDirectory.ts';
import type { IGroupProperties } from '../group/Group.ts';
import type { Item } from '../item/Item.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

const templateTypeSymbol = Symbol('templateTypeSymbol');

export interface ITemplateProperties {
  readonly id: TNominalPrimitive<TId, typeof templateTypeSymbol>;
  readonly nameInSingular: TName;
  readonly nameInPlural: TName;
  readonly displayName: TDisplayName;
  readonly propertiesSchema: IPropertiesSchema;
  readonly createdAt: Date;
  readonly items: readonly Item[];
}

export class Template<
  Id extends ITemplateProperties['id'] = ITemplateProperties['id'],
  NameInSingular extends
    ITemplateProperties['nameInSingular'] = ITemplateProperties['nameInSingular'],
  NameInPlural extends ITemplateProperties['nameInPlural'] = ITemplateProperties['nameInPlural'],
  DisplayName extends ITemplateProperties['displayName'] = ITemplateProperties['displayName'],
  PropertiesSchema extends
    ITemplateProperties['propertiesSchema'] = ITemplateProperties['propertiesSchema'],
  CreatedAt extends ITemplateProperties['createdAt'] = ITemplateProperties['createdAt'],
  Items extends ITemplateProperties['items'] = ITemplateProperties['items'],
> {
  public readonly id: Id;
  public readonly nameInSingular: NameInSingular;
  public readonly nameInPlural: NameInPlural;
  public readonly displayName: DisplayName;
  public readonly propertiesSchema: PropertiesSchema;
  public readonly createdAt: CreatedAt;
  public readonly items: Items;

  public static create<
    NameInSingular extends ITemplateProperties['nameInSingular'],
    NameInPlural extends ITemplateProperties['nameInPlural'],
    DisplayName extends ITemplateProperties['displayName'],
    PropertiesSchema extends ITemplateProperties['propertiesSchema'],
    InstanceAdminId extends IGroupProperties['id'] = IGroupProperties['id'],
  >(param: {
    readonly nameInSingular: NameInSingular;
    readonly nameInPlural: NameInPlural;
    readonly displayName: DisplayName;
    readonly propertiesSchema: PropertiesSchema;
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminId,
      'admin'
    >;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly template: Template<
        ITemplateProperties['id'],
        NameInSingular,
        NameInPlural,
        DisplayName,
        PropertiesSchema,
        ITemplateProperties['createdAt'],
        readonly []
      >;
    },
    NotGroupMemberException
  > {
    if (
      !param.instanceAdminGroupMemberDirectory.members.some(
        extract({ userId: param.myselfCertificate.userId }),
      )
    ) {
      return new Failure(
        new NotGroupMemberException({
          message:
            'インスタンス管理者のメンバー以外のユーザーがテンプレートを編集することはできません。',
        }),
      );
    }

    return new Success({
      template: Template.fromParam({
        id: generateId() as ITemplateProperties['id'],
        nameInSingular: param.nameInSingular,
        nameInPlural: param.nameInPlural,
        displayName: param.displayName,
        propertiesSchema: param.propertiesSchema,
        createdAt: new Date(),
        items: [] as const,
      }),
    });
  }

  public toBodySet<
    NewNameInSingular extends ITemplateProperties['nameInSingular'],
    NewNameInPlural extends ITemplateProperties['nameInPlural'],
    NewDisplayName extends ITemplateProperties['displayName'],
    NewPropertiesSchema extends ITemplateProperties['propertiesSchema'],
    InstanceAdminId extends IGroupProperties['id'] = IGroupProperties['id'],
  >(param: {
    readonly nameInSingular: NewNameInSingular;
    readonly nameInPlural: NewNameInPlural;
    readonly displayName: NewDisplayName;
    readonly propertiesSchema: NewPropertiesSchema;
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminId,
      'admin'
    >;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly template: Template<
        Id,
        NewNameInSingular,
        NewNameInPlural,
        NewDisplayName,
        NewPropertiesSchema,
        CreatedAt,
        Items
      >;
    },
    NotGroupMemberException
  > {
    if (
      !param.instanceAdminGroupMemberDirectory.members.some(
        extract({ userId: param.myselfCertificate.userId }),
      )
    ) {
      return new Failure(
        new NotGroupMemberException({
          message:
            'インスタンス管理者のメンバー以外のユーザーがテンプレートを編集することはできません。',
        }),
      );
    }

    return new Success({
      template: Template.fromParam({
        id: this.id,
        nameInSingular: param.nameInSingular,
        nameInPlural: param.nameInPlural,
        displayName: param.displayName,
        propertiesSchema: param.propertiesSchema,
        createdAt: this.createdAt,
        items: this.items,
      }),
    });
  }

  public static fromParam<
    Id extends ITemplateProperties['id'],
    NameInSingular extends ITemplateProperties['nameInSingular'],
    NameInPlural extends ITemplateProperties['nameInPlural'],
    DisplayName extends ITemplateProperties['displayName'],
    PropertiesSchema extends ITemplateProperties['propertiesSchema'],
    CreatedAt extends ITemplateProperties['createdAt'],
    Items extends ITemplateProperties['items'],
  >(
    param: Pick<
      Template<Id, NameInSingular, NameInPlural, DisplayName, PropertiesSchema, CreatedAt, Items>,
      keyof ITemplateProperties
    >,
  ): Template<Id, NameInSingular, NameInPlural, DisplayName, PropertiesSchema, CreatedAt, Items> {
    return new Template(param);
  }

  private constructor(
    param: Pick<
      Template<Id, NameInSingular, NameInPlural, DisplayName, PropertiesSchema, CreatedAt, Items>,
      keyof ITemplateProperties
    >,
  ) {
    this.id = param.id;
    this.nameInSingular = param.nameInSingular;
    this.nameInPlural = param.nameInPlural;
    this.displayName = param.displayName;
    this.propertiesSchema = param.propertiesSchema;
    this.createdAt = param.createdAt;
    this.items = param.items;
  }
}

interface IPropertiesSchema {
  readonly type?: 'object';
  readonly properties?: {
    readonly [K: string]: IPropertiesSchemaProperty;
  };
  readonly required?: string[];
}

interface IPropertiesSchemaProperty {
  readonly type?: 'string' | 'number' | 'boolean' | 'array';
  readonly items?: {
    readonly type?: Exclude<IPropertiesSchemaProperty['type'], 'array'>;
  };
}
