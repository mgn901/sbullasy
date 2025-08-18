import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyGroupMember,
  verifyItemOperationPermission,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import type { LanguageCode } from '../../lib/i18n.ts';
import { generateId, type Id, isId } from '../../lib/random-values/id.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { Name, Title, TitleForUrl } from '../../values.ts';
import type { Group } from '../group/group.ts';
import type { GroupId } from '../group/values.ts';
import { sbullasyDefaultItemTypes } from './default-item-types.ts';
import type { ItemTypeName } from './item-type.ts';
import { validateProperties } from './schema.ts';

//#region Item
export const itemTypeSymbol = Symbol('item.type');
export const itemWithDetailedLinksTypeSymbol = Symbol('itemWithDetailedLinks.type');
export type ItemId = NominalPrimitive<Id, typeof itemTypeSymbol>;
export type ItemLinkSummary = Pick<Item, 'typeName' | 'id'>;
export type ItemLinkDetailed = Pick<
  Item,
  'typeName' | 'id' | 'lang' | 'name' | 'title' | 'titleForUrl' | 'ownedBy'
>;
export type ItemProperty = {
  readonly rawValue: string | number | boolean | string[] | number[] | boolean[];
};

/**
 * アイテムを表す。
 */
export type Item = {
  readonly [itemTypeSymbol]: typeof itemTypeSymbol;
  readonly id: ItemId;
  readonly typeName: ItemTypeName;
  readonly lang: LanguageCode;
  readonly name: Name;
  readonly title: Title;
  readonly titleForUrl: TitleForUrl;
  readonly properties: Record<
    string,
    ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
  >;
  readonly ownedBy: GroupId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date | undefined;
  readonly status: 'draft' | 'published';
};

export type WithDetailedLinks<I extends Item> = I & {
  readonly [itemWithDetailedLinksTypeSymbol]: typeof itemWithDetailedLinksTypeSymbol;
  readonly properties: Record<
    string,
    ItemLinkDetailed | ItemLinkDetailed[] | ItemProperty | ItemProperty[]
  >;
  readonly ownedBy: Group;
};

/**
 * {@linkcode Item}の状態を変更するための関数を提供する。
 */
export const ItemReducers = {
  create: <
    P extends {
      readonly typeName: ItemTypeName;
      readonly lang: LanguageCode;
      readonly name: Name;
      readonly title: Title;
      readonly titleForUrl: TitleForUrl;
      readonly properties: Record<
        string,
        ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
      >;
      readonly ownedBy: GroupId;
      readonly publishedAt: Date | undefined;
    },
  >(
    params: P,
  ): Item &
    Pick<
      P,
      | 'typeName'
      | 'lang'
      | 'name'
      | 'title'
      | 'titleForUrl'
      | 'properties'
      | 'ownedBy'
      | 'publishedAt'
    > => {
    const now = new Date();
    return {
      [itemTypeSymbol]: itemTypeSymbol,
      id: generateId() as ItemId,
      typeName: params.typeName,
      lang: params.lang,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      ownedBy: params.ownedBy,
      createdAt: now,
      updatedAt: now,
      publishedAt: params.publishedAt,
      status: params.publishedAt === undefined || now < params.publishedAt ? 'draft' : 'published',
    } as const;
  },

  createTranslated: <
    P extends {
      readonly id: ItemId;
      readonly typeName: ItemTypeName;
      readonly lang: LanguageCode;
      readonly name: Name;
      readonly title: Title;
      readonly titleForUrl: TitleForUrl;
      readonly properties: Record<
        string,
        ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
      >;
      readonly ownedBy: GroupId;
      readonly publishedAt: Date | undefined;
    },
  >(
    params: P,
  ): Item &
    Pick<
      P,
      | 'typeName'
      | 'lang'
      | 'name'
      | 'title'
      | 'titleForUrl'
      | 'properties'
      | 'ownedBy'
      | 'publishedAt'
    > => {
    const now = new Date();
    return {
      [itemTypeSymbol]: itemTypeSymbol,
      id: params.id,
      typeName: params.typeName,
      lang: params.lang,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      ownedBy: params.ownedBy,
      createdAt: now,
      updatedAt: now,
      publishedAt: params.publishedAt,
      status: params.publishedAt === undefined || now < params.publishedAt ? 'draft' : 'published',
    } as const;
  },

  update: <
    S extends Item,
    P extends {
      readonly name: Name;
      readonly title: Title;
      readonly titleForUrl: TitleForUrl;
      readonly properties: Record<
        string,
        ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
      >;
      readonly publishedAt: Date | undefined;
    },
  >(
    self: S,
    params: P,
  ): S & { readonly updatedAt: Date; readonly status: 'draft' | 'published' } & Pick<
      P,
      'name' | 'title' | 'titleForUrl' | 'properties' | 'publishedAt'
    > => {
    const now = new Date();
    return {
      ...self,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      publishedAt: params.publishedAt,
      updatedAt: now,
      status: params.publishedAt === undefined || now < params.publishedAt ? 'draft' : 'published',
    } as const;
  },
};

/**
 * {@linkcode Item}を永続化するためのリポジトリ。
 */
export interface ItemRepository {
  getOneById<
    P extends { readonly typeName: ItemTypeName; readonly id: ItemId; readonly lang: LanguageCode },
  >(
    this: ItemRepository,
    params: P,
  ): Promise<FromRepository<Item & Pick<P, 'typeName' | 'id' | 'lang'>> | undefined>;

  getDetailedOneById<
    P extends { readonly typeName: ItemTypeName; readonly id: ItemId; readonly lang: LanguageCode },
  >(
    this: ItemRepository,
    params: P,
  ): Promise<
    FromRepository<WithDetailedLinks<Item> & Pick<P, 'typeName' | 'id' | 'lang'>> | undefined
  >;

  getDetailedOneByName<
    P extends { readonly typeName: ItemTypeName; readonly name: Name; readonly lang: LanguageCode },
  >(
    this: ItemRepository,
    params: P,
  ): Promise<
    FromRepository<WithDetailedLinks<Item> & Pick<P, 'typeName' | 'name' | 'lang'>> | undefined
  >;

  getDetailedOneByTitleForUrl<
    P extends {
      readonly typeName: ItemTypeName;
      readonly titleForUrl: TitleForUrl;
      readonly lang: LanguageCode;
    },
  >(
    this: ItemRepository,
    params: P,
  ): Promise<
    | FromRepository<WithDetailedLinks<Item> & Pick<P, 'typeName' | 'titleForUrl' | 'lang'>>
    | undefined
  >;

  getMany(
    this: ItemRepository,
    params: {
      readonly filters?: Filters<Item>;
      readonly orderBy: OrderBy<Item>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<Item>[] | readonly []>;

  getDetailedMany(
    this: ItemRepository,
    params: {
      readonly filters?: Filters<Item>;
      readonly orderBy: OrderBy<Item>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<WithDetailedLinks<Item>>[] | readonly []>;

  count(this: ItemRepository, params: { readonly filters: Filters<Item> }): Promise<number>;

  createOne(this: ItemRepository, item: Item): Promise<void>;

  updateOne(this: ItemRepository, item: FromRepository<Item>): Promise<void>;

  deleteOneById(this: ItemRepository, itemId: ItemId): Promise<void>;

  deleteMany(this: ItemRepository, params: { readonly filters: Filters<Item> }): Promise<void>;
}
//#endregion

//#region ItemService
export interface ItemServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    typeof verifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly verifyItemOperationPermission: PreApplied<
    typeof verifyItemOperationPermission,
    AccessControlServiceDependencies
  >;
  readonly itemRepository: ItemRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたIDのアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneById = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
  TId extends ItemId,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly id: TId;
    readonly lang: TLang;
  } & ItemServiceDependencies,
): Promise<{
  readonly item: WithDetailedLinks<Item> & { readonly id: TId; readonly lang: TLang };
}> => {
  return getOneBase({
    ...params,
    getFromRepository: () =>
      params.itemRepository.getDetailedOneById({
        typeName: params.typeName,
        id: params.id,
        lang: params.lang,
      }),
  });
};

/**
 * 指定された名前のアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneByName = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
  TName extends Name,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly name: TName;
    readonly lang: TLang;
  } & ItemServiceDependencies,
): Promise<{
  readonly item: WithDetailedLinks<Item> & { readonly name: TName; readonly lang: TLang };
}> => {
  return getOneBase({
    ...params,
    getFromRepository: () =>
      params.itemRepository.getDetailedOneByName({
        typeName: params.typeName,
        name: params.name,
        lang: params.lang,
      }),
  });
};

/**
 * 指定されたタイトルのアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneByTitleForUrl = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
  TTitleForUrl extends TitleForUrl,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly titleForUrl: TTitleForUrl;
    readonly lang: TLang;
  } & ItemServiceDependencies,
): Promise<{
  readonly item: WithDetailedLinks<Item> & {
    readonly titleForUrl: TTitleForUrl;
    readonly lang: TLang;
  };
}> => {
  return getOneBase({
    ...params,
    getFromRepository: () =>
      params.itemRepository.getDetailedOneByTitleForUrl({
        typeName: params.typeName,
        titleForUrl: params.titleForUrl,
        lang: params.lang,
      }),
  });
};

export const getOneBase = async <T extends Item>(
  params: { readonly getFromRepository: () => Promise<T | undefined> } & Pick<
    ItemServiceDependencies,
    'verifyAccessToken' | 'verifyGroupMember' | 'clientContextRepository'
  >,
): Promise<{ readonly item: T }> => {
  const item = await params.getFromRepository();

  if (item === undefined) {
    throw Exception.create({ exceptionName: 'item.notExists' });
  }

  if (item.status === 'draft') {
    try {
      const { myUserAccount } = await params.verifyAccessToken({
        accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
      });
      await params.verifyGroupMember({ groupId: item.ownedBy, userId: myUserAccount.id });
    } catch (error: unknown) {
      if (
        error instanceof Exception &&
        (error.exceptionName === 'accessControl.notGroupMember' ||
          error.exceptionName === 'accessControl.notAuthorized')
      ) {
        throw Exception.create({ exceptionName: 'item.notExists' });
      }
      throw error;
    }
  }

  return { item };
};

/**
 * アイテムの一覧を取得する。
 * - 引数の`filters`プロパティに`ownedBy`を指定した場合で、この操作を行おうとするユーザがそのグループに所属している場合は、下書き状態のアイテムも取得する。
 */
export const getMany = async (
  params: {
    readonly filters?: Filters<Item>;
    readonly orderBy: OrderBy<Item>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
    readonly detailed?: boolean | undefined;
  } & ItemServiceDependencies,
): Promise<{ readonly items: readonly Item[] | readonly [] }> => {
  return getManyBase({
    ...params,
    getFromRepository:
      params.detailed === true
        ? () =>
            params.itemRepository.getDetailedMany({
              filters: params.filters,
              orderBy: params.orderBy,
              offset: params.offset,
              limit: params.limit,
            })
        : () =>
            params.itemRepository.getMany({
              filters: params.filters,
              orderBy: params.orderBy,
              offset: params.offset,
              limit: params.limit,
            }),
  });
};

export const getManyBase = async <
  T extends FromRepository<Item>,
  P extends {
    readonly filters?:
      | { readonly publishedAt?: Date | { readonly until?: Date | undefined } | undefined }
      | undefined;
  },
>(
  params: P & {
    readonly getFromRepository: (params: P) => Promise<readonly T[] | readonly []>;
  } & Pick<
      ItemServiceDependencies,
      'verifyAccessToken' | 'verifyGroupMember' | 'clientContextRepository'
    >,
): Promise<{ readonly items: readonly T[] | readonly [] }> => {
  if (
    params.filters !== undefined &&
    'ownedBy' in params.filters &&
    typeof params.filters.ownedBy === 'string' &&
    isId(params.filters.ownedBy)
  ) {
    try {
      const { myUserAccount } = await params.verifyAccessToken({
        accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
      });
      await params.verifyGroupMember({
        groupId: params.filters?.ownedBy as GroupId,
        userId: myUserAccount.id,
      });

      const items = await params.getFromRepository({ ...params });
      return { items };
    } catch (error: unknown) {
      if (
        error instanceof Exception &&
        error.exceptionName !== 'accessControl.notGroupMember' &&
        error.exceptionName !== 'accessControl.notAuthorized'
      ) {
        throw error;
      }
    }
  }

  const items = await params.getFromRepository({
    ...params,
    filters: { ...params.filters, publishedAt: { until: new Date() } },
  });

  return { items };
};

/**
 * アイテムを作成する。
 * - この操作を行うユーザは、作成しようとしているアイテムの所有グループに所属している必要がある。
 * - 作成しようとしているアイテムの所有グループは、その種類のアイテムを作成することが許可されている必要がある。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const createOne = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
>(
  params: {
    readonly typeName: TTypeName;
    readonly lang: LanguageCode;
    readonly name: Name;
    readonly title: Title;
    readonly titleForUrl: TitleForUrl;
    readonly properties: Record<
      string,
      ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
    >;
    readonly ownedBy: GroupId;
    readonly publishedAt: Date | undefined;
  } & ItemServiceDependencies,
): Promise<{ readonly item: Item }> => {
  return createOneBase({
    ...params,
    create: () => ItemReducers.create(params),
    persist: async (item) => {
      await params.itemRepository.createOne(item);
    },
  });
};

export const createOneBase = async <T extends Item>(
  params: Pick<T, 'typeName' | 'properties' | 'ownedBy'> & {
    readonly create: () => T;
    readonly persist: (item: T) => Promise<void>;
  } & Pick<
      ItemServiceDependencies,
      | 'verifyAccessToken'
      | 'verifyGroupMember'
      | 'verifyItemOperationPermission'
      | 'clientContextRepository'
    >,
): Promise<{ readonly item: T }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupMember({ groupId: params.ownedBy, userId: myUserAccount.id });
  await params.verifyItemOperationPermission({
    groupId: params.ownedBy,
    itemTypeName: params.typeName,
    permissionType: 'create',
  });

  const validatePropertiesResult = validateProperties(
    params.properties,
    sbullasyDefaultItemTypes[params.typeName].schema,
  );
  if (validatePropertiesResult === false) {
    throw Exception.create({ exceptionName: 'item.propertiesInvalid' });
  }

  const item = params.create();
  await params.persist(item);
  return { item };
};

/**
 * アイテムの翻訳版を作成する。
 * - この操作を行うユーザは、作成しようとしているアイテムの所有グループに所属している必要がある。
 * - 翻訳版を作成しようとしているアイテムの所有グループは、その種類のアイテムの翻訳版を作成することが許可されている必要がある。
 * @throws アイテムが見つからない場合、または、所有グループに所属していないユーザがアイテムを更新しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const createTranslated = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
>(
  params: { readonly typeName: TTypeName } & Pick<
    Item,
    'id' | 'lang' | 'name' | 'title' | 'titleForUrl' | 'properties' | 'ownedBy' | 'publishedAt'
  > &
    ItemServiceDependencies,
): Promise<void> => {
  return createTranslatedBase({
    ...params,
    count: async (query) => params.itemRepository.count({ filters: query }),
    create: () => ItemReducers.createTranslated(params),
    persist: async (item) => {
      await params.itemRepository.createOne(item);
    },
  });
};

export const createTranslatedBase = async <T extends Item>(
  params: Pick<T, 'typeName' | 'id' | 'ownedBy' | 'properties'> & {
    readonly count: (query: {
      readonly typeName: ItemTypeName;
      readonly id: ItemId;
    }) => Promise<number>;
    readonly create: () => T;
    readonly persist: (item: T) => Promise<void>;
  } & Pick<
      ItemServiceDependencies,
      | 'verifyAccessToken'
      | 'verifyGroupMember'
      | 'verifyItemOperationPermission'
      | 'clientContextRepository'
    >,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const itemCount = await params.count({ typeName: params.typeName, id: params.id });
  if (itemCount === 0) {
    throw Exception.create({ exceptionName: 'item.notExists' });
  }

  try {
    await params.verifyGroupMember({ groupId: params.ownedBy, userId: myUserAccount.id });
    await params.verifyItemOperationPermission({
      groupId: params.ownedBy,
      itemTypeName: params.typeName,
      permissionType: 'createTranslated',
    });
  } catch (error: unknown) {
    if (error instanceof Exception && error.exceptionName === 'accessControl.notGroupMember') {
      throw Exception.create({ exceptionName: 'item.notExists' });
    }
    throw error;
  }

  const validatePropertiesResult = validateProperties(
    params.properties,
    sbullasyDefaultItemTypes[params.typeName].schema,
  );
  if (validatePropertiesResult === false) {
    throw Exception.create({ exceptionName: 'item.propertiesInvalid' });
  }

  const item = params.create();
  await params.persist(item);
};

/**
 * アイテムを更新する。
 * - この操作を行うユーザは、更新しようとしているアイテムの所有グループに所属している必要がある。
 * - 更新しようとしているアイテムの所有グループは、その種類のアイテムを更新することが許可されている必要がある。
 * @throws アイテムが見つからない場合、または、所有グループに所属していないユーザがアイテムを更新しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const updateOne = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
>(
  params: { readonly typeName: TTypeName } & Pick<
    Item,
    'id' | 'lang' | 'name' | 'title' | 'titleForUrl' | 'properties' | 'publishedAt'
  > &
    ItemServiceDependencies,
): Promise<void> => {
  return updateOneBase({
    ...params,
    getFromRepository: (query) => params.itemRepository.getOneById(query),
    update: (oldItem) => ItemReducers.update(oldItem, params),
    persist: async (item) => {
      await params.itemRepository.updateOne(item);
    },
  });
};

export const updateOneBase = async <O extends FromRepository<Item>, T extends FromRepository<Item>>(
  params: Pick<T, 'typeName' | 'id' | 'lang' | 'properties'> & {
    readonly getFromRepository: (query: {
      readonly typeName: ItemTypeName;
      readonly id: ItemId;
      readonly lang: LanguageCode;
    }) => Promise<O | undefined>;
    readonly update: (oldItem: O) => T;
    readonly persist: (item: T) => Promise<void>;
  } & Pick<
      ItemServiceDependencies,
      | 'verifyAccessToken'
      | 'verifyGroupMember'
      | 'verifyItemOperationPermission'
      | 'clientContextRepository'
    >,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const item = await params.getFromRepository({
    typeName: params.typeName,
    id: params.id,
    lang: params.lang,
  });
  if (item === undefined) {
    throw Exception.create({ exceptionName: 'item.notExists' });
  }

  try {
    await params.verifyGroupMember({ groupId: item.ownedBy, userId: myUserAccount.id });
    await params.verifyItemOperationPermission({
      groupId: item.ownedBy,
      itemTypeName: params.typeName,
      permissionType: 'update',
    });
  } catch (error: unknown) {
    if (error instanceof Exception && error.exceptionName === 'accessControl.notGroupMember') {
      throw Exception.create({ exceptionName: 'item.notExists' });
    }
    throw error;
  }

  const validatePropertiesResult = validateProperties(
    params.properties,
    sbullasyDefaultItemTypes[params.typeName].schema,
  );
  if (validatePropertiesResult === false) {
    throw Exception.create({ exceptionName: 'item.propertiesInvalid' });
  }

  const itemUpdated = params.update(item);
  await params.persist(itemUpdated);
};

/**
 * アイテムを削除する。
 * - この操作を行うユーザは、削除しようとしているアイテムの所有グループに所属している必要がある。
 */
export const deleteOne = async <
  TTypeName extends (typeof sbullasyDefaultItemTypes)[string]['name'],
>(
  params: {
    readonly typeName: TTypeName;
    readonly id: ItemId;
    readonly lang: LanguageCode;
  } & ItemServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const item = await params.itemRepository.getDetailedOneById({
    typeName: params.typeName,
    id: params.id,
    lang: params.lang,
  });
  if (item === undefined) {
    return;
  }

  try {
    await params.verifyGroupMember({ groupId: item.ownedBy, userId: myUserAccount.id });
  } catch (error: unknown) {
    if (error instanceof Exception && error.exceptionName === 'accessControl.notGroupMember') {
      return;
    }
    throw error;
  }

  await params.itemRepository.deleteOneById(params.id);
};
// #endregion
