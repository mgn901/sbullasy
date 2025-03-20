import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyGroupMember,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { Item, ItemId, WithReferences } from './item.ts';

const scheduledEventTypeSymbol = Symbol('scheduledEvent.type');

export type ScheduledEvent = Item & {
  readonly [scheduledEventTypeSymbol]: typeof scheduledEventTypeSymbol;
  readonly dateList: readonly { readonly startedAt: Date; readonly endedAt: Date }[];
};

export interface ScheduledEventRepository {
  getOneById<TId extends ItemId>(
    this: ScheduledEventRepository,
    id: TId,
  ): Promise<FromRepository<WithReferences<ScheduledEvent>>>;

  getMany(params: {
    readonly filters?:
      | (Filters<ScheduledEvent> & {
          readonly from?: Date | undefined;
          readonly until?: Date | undefined;
        })
      | undefined;
    readonly orderBy: OrderBy<
      ScheduledEvent & { readonly startedAt: 'asc' | 'desc'; readonly endedAt: 'asc' | 'desc' }
    >;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  }): Promise<readonly FromRepository<WithReferences<ScheduledEvent>>[] | readonly []>;

  count(params: {
    readonly filters: Filters<ScheduledEvent> & {
      readonly from?: Date | undefined;
      readonly until?: Date | undefined;
    };
  }): Promise<number>;

  createOne(this: ScheduledEventRepository, scheduledEvent: ScheduledEvent): Promise<void>;

  updateOne(
    this: ScheduledEventRepository,
    scheduledEvent: FromRepository<ScheduledEvent>,
  ): Promise<void>;

  deleteOne(this: ScheduledEventRepository, id: ItemId): Promise<void>;

  deleteMany(
    this: ScheduledEventRepository,
    params: { readonly filters: Filters<ScheduledEvent> },
  ): Promise<void>;
}

export interface ScheduledEventServiceReducers {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    typeof verifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly scheduledEventRepository: ScheduledEventRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

export const getMany = async (
  params: {
    readonly filters?:
      | (Filters<ScheduledEvent> & {
          readonly from?: Date | undefined;
          readonly until?: Date | undefined;
        })
      | undefined;
    readonly orderBy: OrderBy<
      ScheduledEvent & { readonly startedAt: 'asc' | 'desc'; readonly endedAt: 'asc' | 'desc' }
    >;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & ScheduledEventServiceReducers,
): Promise<{ readonly scheduledEvents: readonly ScheduledEvent[] | readonly [] }> => {
  // TODO: グループ内部の人は下書きも見られるようにする。
  const scheduledEvents = await params.scheduledEventRepository.getMany({
    filters: { ...params.filters, publishedAt: { until: new Date() } },
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit,
  });

  return { scheduledEvents };
};
