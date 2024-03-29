import { validateByJsonSchema } from '../../utils/json-schema.ts';
import { extract } from '../../utils/predicate.ts';
import type { TNominalPrimitive } from '../../utils/primitive.ts';
import { type TId, generateId } from '../../utils/random-values/id.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import type { GroupMemberDirectory } from '../group-member-directory/GroupMemberDirectory.ts';
import { NotGroupMemberException } from '../group-member-directory/GroupMemberDirectory.ts';
import type { GroupPermissionDirectory } from '../group-permission-directory/GroupPermissionDirectory.ts';
import { NotAllowedToModifyException } from '../group-permission-directory/GroupPermissionDirectory.ts';
import type { IGroupProperties } from '../group/Group.ts';
import type { ITemplateProperties, Template } from '../template/Template.ts';
import { type UserProfile, UserProfileExpiredException } from '../user-profile/UserProfile.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TTitle } from '../values/TTitle.ts';
import type { TTitleForUrl } from '../values/TTitleForUrl.ts';

const itemTypeSymbol = Symbol('itemTypeSymbol');

export interface IItemProperties {
  readonly id: TNominalPrimitive<TId, typeof itemTypeSymbol>;
  readonly title: TTitle;
  readonly titleForUrl: TTitleForUrl;
  readonly template: ITemplateProperties['id'];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: IGroupProperties['id'];
  readonly properties: {
    readonly [K: string]:
      | string
      | number
      | boolean
      | readonly string[]
      | readonly number[]
      | readonly boolean[];
  };
}

export class Item<
  Id extends IItemProperties['id'] = IItemProperties['id'],
  Title extends IItemProperties['title'] = IItemProperties['title'],
  TitleForUrl extends IItemProperties['titleForUrl'] = IItemProperties['titleForUrl'],
  TemplateId extends IItemProperties['template'] = IItemProperties['template'],
  CreatedAt extends IItemProperties['createdAt'] = IItemProperties['createdAt'],
  UpdatedAt extends IItemProperties['updatedAt'] = IItemProperties['updatedAt'],
  CreatedBy extends IItemProperties['createdBy'] = IItemProperties['createdBy'],
  Properties extends IItemProperties['properties'] = IItemProperties['properties'],
> {
  public readonly [itemTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly title: Title;
  public readonly titleForUrl: TitleForUrl;
  public readonly template: TemplateId;
  public readonly createdAt: CreatedAt;
  public readonly updatedAt: UpdatedAt;
  public readonly createdBy: CreatedBy;
  public readonly properties: Properties;

  public static create<
    Title extends IItemProperties['title'],
    TitleForUrl extends IItemProperties['titleForUrl'],
    TemplateId extends IItemProperties['template'],
    CreatedBy extends IItemProperties['createdBy'],
    Properties extends IItemProperties['properties'],
    UserId extends IUserProperties['id'] = IUserProperties['id'],
  >(param: {
    readonly title: Title;
    readonly titleForUrl: TitleForUrl;
    readonly template: Template<TemplateId>;
    readonly properties: Properties;
    readonly userProfile: UserProfile<UserId>;
    readonly groupMemberDirectory: GroupMemberDirectory<CreatedBy>;
    readonly groupPermissionDirectory: GroupPermissionDirectory<CreatedBy>;
    readonly myselfCertificate: MyselfCertificate<UserId>;
  }): TResult<
    {
      readonly item: Item<
        IItemProperties['id'],
        Title,
        TitleForUrl,
        TemplateId,
        IItemProperties['createdAt'],
        IItemProperties['updatedAt'],
        CreatedBy,
        Properties
      >;
    },
    | IllegalPropertiesException
    | NotAllowedToModifyException
    | NotGroupMemberException
    | UserProfileExpiredException
  > {
    if (!param.userProfile.isValidAt({}).value.isValid) {
      return new Failure(
        new UserProfileExpiredException({
          message:
            '学生認証の期限が切れています。アイテムを作成する前に、再度学生認証を受けてください。',
        }),
      );
    }

    if (
      !param.groupMemberDirectory.members.some(extract({ userId: param.myselfCertificate.userId }))
    ) {
      return new Failure(
        new NotGroupMemberException({
          message: '所属していないグループのメンバーとしてアイテムを作成することはできません。',
          isProbablyCausedByClientBug: true,
        }),
      );
    }

    if (
      !param.groupPermissionDirectory.allowedToModify.some((exists) => exists === param.template.id)
    ) {
      return new Failure(
        new NotAllowedToModifyException({
          message: 'グループにこの種類のアイテムを作成する権限がありません。',
        }),
      );
    }

    if (!validateByJsonSchema(param.properties, param.template.propertiesSchema)) {
      return new Failure(
        new IllegalPropertiesException({
          message: 'アイテムの内容がテンプレートで指定されている要件を満たしていません。',
        }),
      );
    }

    const createdAt = new Date();

    return new Success({
      item: Item.fromParam({
        id: generateId() as IItemProperties['id'],
        title: param.title,
        titleForUrl: param.titleForUrl,
        template: param.template.id,
        createdBy: param.groupMemberDirectory.id,
        createdAt,
        updatedAt: createdAt,
        properties: param.properties,
      }),
    });
  }

  public toBodySet<
    NewTitle extends IItemProperties['title'],
    NewTitleForUrl extends IItemProperties['titleForUrl'],
    NewProperties extends IItemProperties['properties'],
    UserId extends IUserProperties['id'] = IUserProperties['id'],
  >(param: {
    readonly title: NewTitle;
    readonly properties: NewProperties;
    readonly userProfile: UserProfile<UserId>;
    readonly groupMemberDirectory: GroupMemberDirectory<CreatedBy>;
    readonly groupPermissionDirectory: GroupPermissionDirectory<CreatedBy>;
    readonly template: Template<TemplateId>;
    readonly myselfCertificate: MyselfCertificate<UserId>;
  }): TResult<
    {
      readonly item: Item<
        Id,
        NewTitle,
        NewTitleForUrl,
        TemplateId,
        CreatedAt,
        IItemProperties['updatedAt'],
        CreatedBy,
        NewProperties
      >;
    },
    | IllegalPropertiesException
    | NotAllowedToModifyException
    | NotGroupMemberException
    | UserProfileExpiredException
  > {
    if (!param.userProfile.isValidAt({}).value.isValid) {
      return new Failure(
        new UserProfileExpiredException({
          message:
            '学生認証の期限が切れています。アイテムを編集する前に、再度学生認証を受けてください。',
        }),
      );
    }

    if (
      !param.groupMemberDirectory.members.some(extract({ userId: param.myselfCertificate.userId }))
    ) {
      return new Failure(
        new NotGroupMemberException({
          message:
            '作成したグループのメンバー以外のユーザーがこのアイテムを編集することはできません。',
        }),
      );
    }

    if (
      !param.groupPermissionDirectory.allowedToModify.some((exists) => exists === this.template)
    ) {
      return new Failure(
        new NotAllowedToModifyException({
          message: 'グループにこの種類のアイテムを編集する権限がありません。',
        }),
      );
    }

    if (!validateByJsonSchema(param.properties, param.template.propertiesSchema)) {
      return new Failure(
        new IllegalPropertiesException({
          message: 'アイテムの内容がテンプレートで指定されている要件を満たしていません。',
        }),
      );
    }

    return new Success({
      item: Item.fromParam({
        id: this.id,
        title: param.title,
        titleForUrl: param.title.toLowerCase() as NewTitleForUrl,
        template: this.template,
        createdAt: this.createdAt,
        updatedAt: new Date(),
        createdBy: this.createdBy,
        properties: param.properties,
      }),
    });
  }

  public static fromParam<
    Id extends IItemProperties['id'],
    Title extends IItemProperties['title'],
    TitleForUrl extends IItemProperties['titleForUrl'],
    TemplateId extends IItemProperties['template'],
    CreatedAt extends IItemProperties['createdAt'],
    UpdatedAt extends IItemProperties['updatedAt'],
    CreatedBy extends IItemProperties['createdBy'],
    Properties extends IItemProperties['properties'],
  >(
    param: Pick<
      Item<Id, Title, TitleForUrl, TemplateId, CreatedAt, UpdatedAt, CreatedBy, Properties>,
      keyof IItemProperties
    >,
  ): Item<Id, Title, TitleForUrl, TemplateId, CreatedAt, UpdatedAt, CreatedBy, Properties> {
    return new Item(param);
  }

  private constructor(
    param: Pick<
      Item<Id, Title, TitleForUrl, TemplateId, CreatedAt, UpdatedAt, CreatedBy, Properties>,
      keyof IItemProperties
    >,
  ) {
    this.id = param.id;
    this.title = param.title;
    this.titleForUrl = param.titleForUrl;
    this.template = param.template;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.createdBy = param.createdBy;
    this.properties = param.properties;
  }
}

export class IllegalPropertiesException extends ApplicationErrorOrException {
  public readonly name = 'IllegalPropertiesException';
}
