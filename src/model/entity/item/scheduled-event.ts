import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
  PreAppliedVerifyAccessToken,
  PreAppliedVerifyGroupMember,
  PreAppliedVerifyItemOperationPermission,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { LanguageCode } from '../../lib/i18n.ts';
import { generateId } from '../../lib/random-values/id.ts';
import type { Name, Title, TitleForUrl } from '../../values.ts';
import type { GroupId } from '../group/values.ts';
import type { sbullasyDefaultItemTypes } from './default-item-types.ts';
import {
  createOneBase,
  createTranslatedBase,
  getManyBase,
  getOneBase,
  type Item,
  type ItemId,
  type ItemLinkSummary,
  type ItemProperty,
  itemTypeSymbol,
  updateOneBase,
  type WithDetailedLinks,
} from './item.ts';
import type { ItemTypeName } from './item-type.ts';

//#region ScheduledEvent and ScheduledEventRepository
export const scheduledEventTypeSymbol = Symbol('scheduledEvent.type');
export type DateList = readonly { readonly startedAt: Date; readonly endedAt: Date }[];

export type ScheduledEvent = Item & {
  readonly [scheduledEventTypeSymbol]: typeof scheduledEventTypeSymbol;
  readonly dateList: readonly { readonly startedAt: Date; readonly endedAt: Date }[];
};

export const ScheduledEventReducers = {
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
      readonly dateList: DateList;
      readonly ownedBy: GroupId;
      readonly publishedAt: Date | undefined;
    },
  >(
    params: P,
  ): ScheduledEvent &
    Pick<
      P,
      | 'typeName'
      | 'lang'
      | 'name'
      | 'title'
      | 'titleForUrl'
      | 'properties'
      | 'dateList'
      | 'ownedBy'
      | 'publishedAt'
    > => {
    const now = new Date();
    return {
      [itemTypeSymbol]: itemTypeSymbol,
      [scheduledEventTypeSymbol]: scheduledEventTypeSymbol,
      id: generateId() as ItemId,
      typeName: params.typeName,
      lang: params.lang,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      dateList: params.dateList,
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
      readonly dateList: DateList;
      readonly ownedBy: GroupId;
      readonly publishedAt: Date | undefined;
    },
  >(
    params: P,
  ): ScheduledEvent &
    Pick<
      P,
      | 'typeName'
      | 'lang'
      | 'name'
      | 'title'
      | 'titleForUrl'
      | 'properties'
      | 'dateList'
      | 'ownedBy'
      | 'publishedAt'
    > => {
    const now = new Date();
    return {
      [itemTypeSymbol]: itemTypeSymbol,
      [scheduledEventTypeSymbol]: scheduledEventTypeSymbol,
      id: params.id,
      typeName: params.typeName,
      lang: params.lang,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      dateList: params.dateList,
      ownedBy: params.ownedBy,
      createdAt: now,
      updatedAt: now,
      publishedAt: params.publishedAt,
      status: params.publishedAt === undefined || now < params.publishedAt ? 'draft' : 'published',
    } as const;
  },

  update: <
    S extends ScheduledEvent,
    P extends {
      readonly name: Name;
      readonly title: Title;
      readonly titleForUrl: TitleForUrl;
      readonly properties: Record<
        string,
        ItemLinkSummary | ItemLinkSummary[] | ItemProperty | ItemProperty[]
      >;
      readonly dateList: DateList;
      readonly publishedAt: Date | undefined;
    },
  >(
    self: S,
    params: P,
  ): S & { readonly updatedAt: Date; readonly status: 'draft' | 'published' } & Pick<
      P,
      'name' | 'title' | 'titleForUrl' | 'properties' | 'dateList' | 'publishedAt'
    > => {
    const now = new Date();
    return {
      ...self,
      name: params.name,
      title: params.title,
      titleForUrl: params.titleForUrl,
      properties: params.properties,
      dateList: params.dateList,
      publishedAt: params.publishedAt,
      updatedAt: now,
      status: params.publishedAt === undefined || now < params.publishedAt ? 'draft' : 'published',
    } as const;
  },
};

export interface ScheduledEventRepository {
  getOneById<
    P extends { readonly typeName: ItemTypeName; readonly id: ItemId; readonly lang: LanguageCode },
  >(
    this: ScheduledEventRepository,
    params: P,
  ): Promise<FromRepository<ScheduledEvent & Pick<P, 'typeName' | 'id' | 'lang'>> | undefined>;

  getDetailedOneById<
    P extends { readonly typeName: ItemTypeName; readonly id: ItemId; readonly lang: LanguageCode },
  >(
    this: ScheduledEventRepository,
    params: P,
  ): Promise<
    | FromRepository<WithDetailedLinks<ScheduledEvent> & Pick<P, 'typeName' | 'id' | 'lang'>>
    | undefined
  >;

  getDetailedOneByName<
    P extends { readonly typeName: ItemTypeName; readonly name: Name; readonly lang: LanguageCode },
  >(
    this: ScheduledEventRepository,
    params: P,
  ): Promise<
    | FromRepository<WithDetailedLinks<ScheduledEvent> & Pick<P, 'typeName' | 'name' | 'lang'>>
    | undefined
  >;

  getDetailedOneByTitleForUrl<
    P extends {
      readonly typeName: ItemTypeName;
      readonly titleForUrl: TitleForUrl;
      readonly lang: LanguageCode;
    },
  >(
    this: ScheduledEventRepository,
    params: P,
  ): Promise<
    | FromRepository<
        WithDetailedLinks<ScheduledEvent> & Pick<P, 'typeName' | 'titleForUrl' | 'lang'>
      >
    | undefined
  >;

  getMany(
    this: ScheduledEventRepository,
    params: {
      readonly filters?: Filters<ScheduledEvent> | undefined;
      readonly orderBy: OrderBy<
        ScheduledEvent & { readonly startedAt: 'asc' | 'desc'; readonly endedAt: 'asc' | 'desc' }
      >;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<WithDetailedLinks<ScheduledEvent>>[] | readonly []>;

  getDetailedMany(
    this: ScheduledEventRepository,
    params: {
      readonly filters?: Filters<ScheduledEvent> | undefined;
      readonly orderBy: OrderBy<
        ScheduledEvent & { readonly startedAt: 'asc' | 'desc'; readonly endedAt: 'asc' | 'desc' }
      >;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<WithDetailedLinks<ScheduledEvent>>[] | readonly []>;

  count(
    this: ScheduledEventRepository,
    params: { readonly filters?: Filters<ScheduledEvent> | undefined },
  ): Promise<number>;

  createOne(this: ScheduledEventRepository, scheduledEvent: ScheduledEvent): Promise<void>;

  updateOne(
    this: ScheduledEventRepository,
    scheduledEvent: FromRepository<ScheduledEvent>,
  ): Promise<void>;

  deleteMany(
    this: ScheduledEventRepository,
    params: { readonly filters: Filters<ScheduledEvent> },
  ): Promise<void>;
}
//#endregion

//#region ScheduledEventService
export interface ScheduledEventServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    PreAppliedVerifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly verifyItemOperationPermission: PreApplied<
    PreAppliedVerifyItemOperationPermission,
    AccessControlServiceDependencies
  >;
  readonly scheduledEventRepository: ScheduledEventRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたIDのアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneById = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
  TId extends ItemId,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly id: TId;
    readonly lang: TLang;
  } & ScheduledEventServiceDependencies,
): Promise<{
  readonly scheduledEvent: WithDetailedLinks<ScheduledEvent> & {
    readonly id: TId;
    readonly lang: TLang;
  };
}> => {
  const { item: scheduledEvent } = await getOneBase({
    ...params,
    getFromRepository: () =>
      params.scheduledEventRepository.getDetailedOneById({
        typeName: params.typeName,
        id: params.id,
        lang: params.lang,
      }),
  });
  return { scheduledEvent };
};

/**
 * 指定された名前のアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneByName = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
  TName extends Name,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly name: TName;
    readonly lang: TLang;
  } & ScheduledEventServiceDependencies,
): Promise<{
  readonly scheduledEvent: WithDetailedLinks<ScheduledEvent> & {
    readonly name: TName;
    readonly lang: TLang;
  };
}> => {
  const { item: scheduledEvent } = await getOneBase({
    ...params,
    getFromRepository: () =>
      params.scheduledEventRepository.getDetailedOneByName({
        typeName: params.typeName,
        name: params.name,
        lang: params.lang,
      }),
  });
  return { scheduledEvent };
};

/**
 * 指定されたタイトルのアイテムを取得する。
 * @throws アイテムが見つからない場合、または、下書き状態のアイテムを所有グループに所属していないユーザが取得しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 */
export const getOneByTitleForUrl = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
  TTitleForUrl extends TitleForUrl,
  TLang extends LanguageCode,
>(
  params: {
    readonly typeName: TTypeName;
    readonly titleForUrl: TTitleForUrl;
    readonly lang: TLang;
  } & ScheduledEventServiceDependencies,
): Promise<{
  readonly scheduledEvent: WithDetailedLinks<ScheduledEvent> & {
    readonly titleForUrl: TTitleForUrl;
    readonly lang: TLang;
  };
}> => {
  const { item: scheduledEvent } = await getOneBase({
    ...params,
    getFromRepository: () =>
      params.scheduledEventRepository.getDetailedOneByTitleForUrl({
        typeName: params.typeName,
        titleForUrl: params.titleForUrl,
        lang: params.lang,
      }),
  });
  return { scheduledEvent };
};

export const getMany = async (
  params: {
    readonly filters?: Filters<ScheduledEvent> | undefined;
    readonly orderBy: OrderBy<
      ScheduledEvent & { readonly startedAt: 'asc' | 'desc'; readonly endedAt: 'asc' | 'desc' }
    >;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
    readonly detailed?: boolean | undefined;
  } & ScheduledEventServiceDependencies,
): Promise<{ readonly scheduledEvents: readonly ScheduledEvent[] | readonly [] }> => {
  const { items: scheduledEvents } = await getManyBase({
    ...params,
    getFromRepository:
      params.detailed === true
        ? () =>
            params.scheduledEventRepository.getDetailedMany({
              filters: params.filters,
              orderBy: params.orderBy,
              offset: params.offset,
              limit: params.limit,
            })
        : () =>
            params.scheduledEventRepository.getMany({
              filters: params.filters,
              orderBy: params.orderBy,
              offset: params.offset,
              limit: params.limit,
            }),
  });

  return { scheduledEvents };
};

/**
 * アイテムを作成する。
 * - この操作を行うユーザは、作成しようとしているアイテムの所有グループに所属している必要がある。
 * - 作成しようとしているアイテムの所有グループは、その種類のアイテムを作成することが許可されている必要がある。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const createOne = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
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
    readonly dateList: DateList;
    readonly ownedBy: GroupId;
    readonly publishedAt: Date | undefined;
  } & ScheduledEventServiceDependencies,
): Promise<{ readonly scheduledEvent: ScheduledEvent }> => {
  const { item: scheduledEvent } = await createOneBase({
    ...params,
    create: () => ScheduledEventReducers.create(params),
    persist: async (scheduledEvent) => {
      await params.scheduledEventRepository.createOne(scheduledEvent);
    },
  });
  return { scheduledEvent };
};

/**
 * アイテムの翻訳版を作成する。
 * - この操作を行うユーザは、作成しようとしているアイテムの所有グループに所属している必要がある。
 * - 翻訳版を作成しようとしているアイテムの所有グループは、その種類のアイテムの翻訳版を作成することが許可されている必要がある。
 * @throws アイテムが見つからない場合、または、所有グループに所属していないユーザがアイテムを更新しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const createTranslated = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
>(
  params: { readonly typeName: TTypeName } & Pick<
    ScheduledEvent,
    | 'id'
    | 'lang'
    | 'name'
    | 'title'
    | 'titleForUrl'
    | 'properties'
    | 'dateList'
    | 'ownedBy'
    | 'publishedAt'
  > &
    ScheduledEventServiceDependencies,
): Promise<void> => {
  return createTranslatedBase({
    ...params,
    count: async (query) => params.scheduledEventRepository.count({ filters: query }),
    create: () => ScheduledEventReducers.createTranslated(params),
    persist: async (item) => {
      await params.scheduledEventRepository.createOne(item);
    },
  });
};

/**
 * アイテムを更新する。
 * - この操作を行うユーザは、更新しようとしているアイテムの所有グループに所属している必要がある。
 * - 更新しようとしているアイテムの所有グループは、その種類のアイテムを更新することが許可されている必要がある。
 * @throws アイテムが見つからない場合、または、所有グループに所属していないユーザがアイテムを更新しようとしている場合は、{@linkcode Exception}（`item.notExists`）を投げる。
 * @throws アイテムのプロパティがスキーマに従っていない場合は、{@linkcode Exception}（`item.propertiesInvalid`）を投げる。
 */
export const updateOne = async <
  TTypeName extends
    (typeof sbullasyDefaultItemTypes)[keyof typeof sbullasyDefaultItemTypes]['name'],
>(
  params: { readonly typeName: TTypeName } & Pick<
    ScheduledEvent,
    'id' | 'lang' | 'name' | 'title' | 'titleForUrl' | 'properties' | 'dateList' | 'publishedAt'
  > &
    ScheduledEventServiceDependencies,
): Promise<void> => {
  return updateOneBase({
    ...params,
    getFromRepository: (query) => params.scheduledEventRepository.getOneById(query),
    update: (oldItem) => ScheduledEventReducers.update(oldItem, params),
    persist: async (item) => {
      await params.scheduledEventRepository.updateOne(item);
    },
  });
};
//#endregion
