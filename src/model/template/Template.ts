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
import type { IItemRepositoryDeleteManyParams } from '../repositories/IItemRepository.ts';
import type {
  ITemplateRepositoryDeleteOneParams,
  ITemplateRepositoryGetManyParams,
  ITemplateRepositoryGetOneByIdParams,
} from '../repositories/ITemplateRepository.ts';
import type { IDaoRequestOptions } from '../repositories/dao-types.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

const templateTypeSymbol = Symbol('templateTypeSymbol');

export interface ITemplateProperties {
  readonly id: TNominalPrimitive<TId, typeof templateTypeSymbol>;
  readonly nameInSingular: TName;
  readonly nameInPlural: TName;
  readonly displayName: TDisplayName;
  readonly propertiesSchema: IPropertiesSchema;
  readonly keysIncludedInSummary: readonly (keyof IPropertiesSchema)[];
  readonly createdAt: Date;
}

export class Template<
  Id extends ITemplateProperties['id'] = ITemplateProperties['id'],
  NameInSingular extends
    ITemplateProperties['nameInSingular'] = ITemplateProperties['nameInSingular'],
  NameInPlural extends ITemplateProperties['nameInPlural'] = ITemplateProperties['nameInPlural'],
  DisplayName extends ITemplateProperties['displayName'] = ITemplateProperties['displayName'],
  PropertiesSchema extends
    ITemplateProperties['propertiesSchema'] = ITemplateProperties['propertiesSchema'],
  KeysIncludedInSummary extends
    readonly (keyof PropertiesSchema)[] = readonly (keyof PropertiesSchema)[],
  CreatedAt extends ITemplateProperties['createdAt'] = ITemplateProperties['createdAt'],
> {
  public readonly [templateTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly nameInSingular: NameInSingular;
  public readonly nameInPlural: NameInPlural;
  public readonly displayName: DisplayName;
  public readonly propertiesSchema: PropertiesSchema;
  public readonly keysIncludedInSummary: KeysIncludedInSummary;
  public readonly createdAt: CreatedAt;

  public static create<
    NameInSingular extends ITemplateProperties['nameInSingular'],
    NameInPlural extends ITemplateProperties['nameInPlural'],
    DisplayName extends ITemplateProperties['displayName'],
    PropertiesSchema extends ITemplateProperties['propertiesSchema'],
    KeysIncludedInSummary extends readonly (keyof PropertiesSchema)[],
    InstanceAdminGroupId extends IGroupProperties['id'],
  >(param: {
    readonly nameInSingular: NameInSingular;
    readonly nameInPlural: NameInPlural;
    readonly displayName: DisplayName;
    readonly propertiesSchema: PropertiesSchema;
    readonly keysIncludedInSummary: KeysIncludedInSummary;
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminGroupId,
      'admin'
    >;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminGroupId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly template: Template<
        ITemplateProperties['id'],
        NameInSingular,
        NameInPlural,
        DisplayName,
        PropertiesSchema,
        KeysIncludedInSummary,
        ITemplateProperties['createdAt']
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
        keysIncludedInSummary: param.keysIncludedInSummary,
        createdAt: new Date(),
      }),
    });
  }

  public static createGetByIdRequest<Id extends ITemplateProperties['id']>(param: {
    readonly id: Id;
  }): Success<{
    readonly daoRequest: ITemplateRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public static createGetManyRequest(param: {
    readonly options?: ITemplateRepositoryGetManyParams<Template, Record<never, never>>['options'];
  }): Success<{
    readonly daoRequest: ITemplateRepositoryGetManyParams<Template, Record<never, never>>;
  }> {
    return new Success({
      daoRequest: {
        query: {},
        options: param.options,
      },
    });
  }

  public createDeleteRequest<InstanceAdminGroupId extends IGroupProperties['id']>(param: {
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminGroupId,
      'admin'
    >;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminGroupId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly daoRequests: readonly [
        IItemRepositoryDeleteManyParams,
        ITemplateRepositoryDeleteOneParams<Id>,
      ];
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
            'インスタンス管理者のメンバー以外のユーザーがテンプレートを削除することはできません。',
        }),
      );
    }

    return new Success({
      daoRequests: [{ query: { template: this.id } }, { id: this.id }] as const,
    });
  }

  public createGetItemsRequest(param: IItemSearchRequest<PropertiesSchema>): Success<{
    readonly seatchRequest: typeof param;
  }> {
    return new Success({
      seatchRequest: param,
    });
  }

  public toBodySet<
    NewNameInSingular extends ITemplateProperties['nameInSingular'],
    NewNameInPlural extends ITemplateProperties['nameInPlural'],
    NewDisplayName extends ITemplateProperties['displayName'],
    NewPropertiesSchema extends ITemplateProperties['propertiesSchema'],
    NewKeysIncludedInSummary extends readonly (keyof NewPropertiesSchema)[],
    InstanceAdminGroupId extends IGroupProperties['id'],
  >(param: {
    readonly nameInSingular: NewNameInSingular;
    readonly nameInPlural: NewNameInPlural;
    readonly displayName: NewDisplayName;
    readonly propertiesSchema: NewPropertiesSchema;
    readonly instanceAdminGroupPermissionDirectory: GroupPermissionDirectory<
      InstanceAdminGroupId,
      'admin'
    >;
    readonly keysIncludedInSummary: NewKeysIncludedInSummary;
    readonly instanceAdminGroupMemberDirectory: GroupMemberDirectory<InstanceAdminGroupId>;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly template: Template<
        Id,
        NewNameInSingular,
        NewNameInPlural,
        NewDisplayName,
        NewPropertiesSchema,
        NewKeysIncludedInSummary,
        CreatedAt
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
        keysIncludedInSummary: param.keysIncludedInSummary,
        createdAt: this.createdAt,
      }),
    });
  }

  public static fromParam<
    Id extends ITemplateProperties['id'],
    NameInSingular extends ITemplateProperties['nameInSingular'],
    NameInPlural extends ITemplateProperties['nameInPlural'],
    DisplayName extends ITemplateProperties['displayName'],
    PropertiesSchema extends ITemplateProperties['propertiesSchema'],
    KeysIncludedInSummary extends readonly (keyof PropertiesSchema)[],
    CreatedAt extends ITemplateProperties['createdAt'],
  >(
    param: Pick<
      Template<
        Id,
        NameInSingular,
        NameInPlural,
        DisplayName,
        PropertiesSchema,
        KeysIncludedInSummary,
        CreatedAt
      >,
      keyof ITemplateProperties
    >,
  ): Template<
    Id,
    NameInSingular,
    NameInPlural,
    DisplayName,
    PropertiesSchema,
    KeysIncludedInSummary,
    CreatedAt
  > {
    return new Template(param);
  }

  private constructor(
    param: Pick<
      Template<
        Id,
        NameInSingular,
        NameInPlural,
        DisplayName,
        PropertiesSchema,
        KeysIncludedInSummary,
        CreatedAt
      >,
      keyof ITemplateProperties
    >,
  ) {
    this.id = param.id;
    this.nameInSingular = param.nameInSingular;
    this.nameInPlural = param.nameInPlural;
    this.displayName = param.displayName;
    this.propertiesSchema = param.propertiesSchema;
    this.keysIncludedInSummary = param.keysIncludedInSummary;
    this.createdAt = param.createdAt;
  }
}

export interface IPropertiesSchema {
  readonly type: 'object';
  readonly properties: {
    readonly [K: string]: TPropertiesSchemaPrimitiveTypeProperty | TPropertiesSchemaArrayProperty;
  };
  readonly required?: string[];
}

type TPropertiesSchemaPrimitiveTypeProperty = {
  readonly type: 'string' | 'number' | 'boolean';
};
type TPropertiesSchemaArrayProperty = {
  readonly type: 'array';
  readonly items: {
    readonly type: 'string' | 'number' | 'boolean';
  };
};

export interface IItemSearchRequest<
  PropertiesSchema extends ITemplateProperties['propertiesSchema'],
> {
  readonly query: {
    [K in keyof PropertiesSchema['properties']]?: PropertiesSchema['properties'][K] extends TPropertiesSchemaArrayProperty
      ? readonly (readonly [
          'includes' | 'notIncludes',
          {
            string: string;
            number: number;
            boolean: boolean;
          }[PropertiesSchema['properties'][K]['items']['type']],
        ])[]
      : readonly (readonly [
          '===' | '!==' | '<' | '>',
          {
            string: string;
            number: number;
            boolean: boolean;
            array: never;
          }[PropertiesSchema['properties'][K]['type']],
        ])[];
  };
  readonly options: Pick<IDaoRequestOptions<PropertiesSchema['properties']>, 'limit' | 'offset'>;
}
