import type { Client } from './asyncify-events/Client.ts';
import {
  type TimeWindowRateLimitationRule,
  calculateNextExecutionDate,
} from './time-window-rate-limitation.ts';
import type { TypedEventTarget } from './typed-event-target.ts';

export class Execution<
  TId,
  TFunc extends (this: unknown, ...args: never[]) => TReturned,
  TReturned,
> {
  public readonly id: TId;
  public readonly args: Readonly<Parameters<TFunc>>;
  public readonly executedAt: Date;
  public readonly isExecuted: boolean;

  public toExecuted(this: Execution<TId, TFunc, TReturned>): Execution<TId, TFunc, TReturned> {
    return Execution.from({ ...this, isExecuted: true });
  }

  public static createFactory<
    TId,
    TFunc extends (this: unknown, ...args: never[]) => TReturned,
    TReturned,
  >(
    this: unknown,
    params: { readonly generateId: () => TId },
  ): (
    params: Pick<Execution<TId, TFunc, TReturned>, 'args' | 'executedAt'>,
  ) => Execution<TId, TFunc, TReturned> {
    const { generateId } = params;

    return (params) =>
      Execution.from({
        ...params,
        id: generateId() as Execution<TId, TFunc, TReturned>['id'],
        isExecuted: false,
      });
  }

  public static from<TId, TFunc extends (this: unknown, ...args: never[]) => TReturned, TReturned>(
    this: unknown,
    params: Pick<Execution<TId, TFunc, TReturned>, 'id' | 'args' | 'executedAt' | 'isExecuted'>,
  ): Execution<TId, TFunc, TReturned> {
    return new Execution(params);
  }

  private constructor(
    params: Pick<Execution<TId, TFunc, TReturned>, 'id' | 'args' | 'executedAt' | 'isExecuted'>,
  ) {
    this.id = params.id;
    this.args = params.args;
    this.executedAt = params.executedAt;
    this.isExecuted = params.isExecuted;
  }
}

export interface ExecutionRepository<
  TId,
  TFunc extends (this: unknown, ...args: never[]) => TReturned,
  TReturned,
> {
  getOneById(
    this: ExecutionRepository<TId, TFunc, TReturned>,
    id: TId,
  ): Promise<Execution<TId, TFunc, TReturned> | undefined>;

  getMany(
    this: ExecutionRepository<TId, TFunc, TReturned>,
    params: {
      readonly filters?:
        | {
            readonly executedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly isExecuted?: boolean | undefined;
          }
        | undefined;
      readonly orderBy: { readonly executedAt: 'asc' | 'desc' };
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly Execution<TId, TFunc, TReturned>[] | readonly []>;

  count(
    this: ExecutionRepository<TId, TFunc, TReturned>,
    params: {
      readonly filters?:
        | {
            readonly executedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly isExecuted?: boolean | undefined;
          }
        | undefined;
    },
  ): Promise<number>;

  saveOne(
    this: ExecutionRepository<TId, TFunc, TReturned>,
    execution: Execution<TId, TFunc, TReturned>,
  ): Promise<void>;

  deleteOneById(this: ExecutionRepository<TId, TFunc, TReturned>, id: TId): Promise<void>;
}

//#region ExecutionQueueEvent
class ScheduleChangeEvent extends Event {
  public readonly newSchedule: Date;

  public constructor(
    params: { readonly newSchedule: Date },
    eventInitDict?: EventInit | undefined,
  ) {
    super('scheduleChange', eventInitDict);
    this.newSchedule = params.newSchedule;
  }
}

type ExecutionQueueEvent = ScheduleChangeEvent;

type ExecutionQueueEventTarget = TypedEventTarget<ExecutionQueueEvent>;
//#endregion

export interface ExecutionQueue<
  TId,
  TFunc extends (this: unknown, ...args: never[]) => TReturned,
  TReturned,
> {
  enqueue(
    this: ExecutionQueue<TId, TFunc, TReturned>,
    args: Readonly<Parameters<TFunc>>,
  ): Promise<Execution<TId, TFunc, TReturned>>;
  cancel(this: ExecutionQueue<TId, TFunc, TReturned>, id: TId): Promise<void>;
}

//#region Implementations of `ExecutionQueue`
export class ExecutionQueueWithTimeWindowRateLimitation<
  TId,
  TFunc extends (this: unknown, ...args: never[]) => TReturned,
  TReturned,
> implements ExecutionQueue<TId, TFunc, TReturned>
{
  private readonly client: Client<TFunc, TReturned>;
  private readonly timeWindowRateLimitationRulesSorted: readonly TimeWindowRateLimitationRule[];
  private readonly executionFactory: (
    this: unknown,
    params: Pick<Execution<TId, TFunc, TReturned>, 'args' | 'executedAt'>,
  ) => Execution<TId, TFunc, TReturned>;

  private readonly executionRepository: ExecutionRepository<TId, TFunc, TReturned>;
  private readonly reservationEventTarget: EventTarget;
  private registeredExecution: Execution<TId, TFunc, TReturned> | undefined;
  private registeredExecutionAbortController: AbortController | undefined;

  public async enqueue(
    this: ExecutionQueueWithTimeWindowRateLimitation<TId, TFunc, TReturned>,
    args: Readonly<Parameters<TFunc>>,
  ): Promise<Execution<TId, TFunc, TReturned>> {
    const executedAt = await calculateNextExecutionDate({
      timeWindowRateLimitationRules: this.timeWindowRateLimitationRulesSorted,
      getNewestExecutionDateInLatestTimeWindow: async () =>
        (await this.executionRepository.getMany({ orderBy: { executedAt: 'desc' }, limit: 1 }))[0]
          ?.executedAt ?? new Date(),
      getOldestExecutionDateInLatestTimeWindow: async (startOfLastTimeWindow: Date) =>
        (
          await this.executionRepository.getMany({
            filters: { executedAt: { from: startOfLastTimeWindow } },
            orderBy: { executedAt: 'asc' },
            limit: 1,
          })
        )[0]?.executedAt,
      countExecutionsInLatestTimeWindow: (startOfLastTimeWindow: Date) =>
        this.executionRepository.count({
          filters: { executedAt: { from: startOfLastTimeWindow } },
        }),
    });

    const execution = this.executionFactory({ args, executedAt });
    await this.executionRepository.saveOne(execution);
    this.reservationEventTarget.dispatchEvent(new Event('enqueue'));

    return execution;
  }

  public async cancel(
    this: ExecutionQueueWithTimeWindowRateLimitation<TId, TFunc, TReturned>,
    id: TId,
  ): Promise<void> {
    if (id === this.registeredExecution?.id) {
      this.registeredExecutionAbortController?.abort();
    }

    const execution = await this.executionRepository.getOneById(id);
    if (execution?.isExecuted === false) {
      await this.executionRepository.deleteOneById(id);
      this.reservationEventTarget.dispatchEvent(new Event('cancel'));
    }
  }

  public static create<
    TId,
    TFunc extends (this: unknown, ...args: never[]) => TReturned,
    TReturned,
  >(
    this: unknown,
    params: {
      readonly client: Client<TFunc, TReturned>;
      readonly timeWindowRateLimitationRules: readonly TimeWindowRateLimitationRule[];
      readonly executionFactory: (
        this: unknown,
        params: Pick<Execution<TId, TFunc, TReturned>, 'args' | 'executedAt'>,
      ) => Execution<TId, TFunc, TReturned>;
      readonly executionRepository: ExecutionRepository<TId, TFunc, TReturned>;
    },
  ): ExecutionQueueWithTimeWindowRateLimitation<TId, TFunc, TReturned> {
    return new ExecutionQueueWithTimeWindowRateLimitation(params);
  }

  private constructor(params: {
    readonly client: Client<TFunc, TReturned>;
    readonly timeWindowRateLimitationRules: readonly TimeWindowRateLimitationRule[];
    readonly executionFactory: (
      this: unknown,
      params: Pick<Execution<TId, TFunc, TReturned>, 'args' | 'executedAt'>,
    ) => Execution<TId, TFunc, TReturned>;
    readonly executionRepository: ExecutionRepository<TId, TFunc, TReturned>;
  }) {
    // イベントハンドラの定義
    // 予約された実行がない場合は、次の実行待ちを予約する関数
    const registerIfNextExecutionNonregistered = async () => {
      if (this.registeredExecution !== undefined) {
        return;
      }

      const [nextExecution] = await this.executionRepository.getMany({
        orderBy: { executedAt: 'asc' },
        filters: { isExecuted: false },
        limit: 1,
      });
      if (nextExecution === undefined) {
        return;
      }

      this.registeredExecution = nextExecution;
      this.registeredExecutionAbortController = new AbortController();
      const executionDate = new Date(Math.max(nextExecution.executedAt.getTime(), Date.now()));

      const onExecutionDate = async () => {
        await this.client.request(...nextExecution.args);

        this.registeredExecution = undefined;
        this.registeredExecutionAbortController = undefined;
        await this.executionRepository.saveOne(nextExecution.toExecuted());
        this.reservationEventTarget.dispatchEvent(new Event('complete'));
      };

      executeAt({
        date: executionDate,
        func: onExecutionDate,
        abortSignal: this.registeredExecutionAbortController.signal,
      });
    };

    this.client = params.client;
    this.timeWindowRateLimitationRulesSorted = params.timeWindowRateLimitationRules;
    this.executionFactory = params.executionFactory;
    this.executionRepository = params.executionRepository;
    this.reservationEventTarget = new EventTarget();

    this.reservationEventTarget.addEventListener('complete', registerIfNextExecutionNonregistered);
    this.reservationEventTarget.addEventListener('enqueue', registerIfNextExecutionNonregistered);
    this.reservationEventTarget.addEventListener('cancel', registerIfNextExecutionNonregistered);

    registerIfNextExecutionNonregistered();
  }
}

const sleep = (params: {
  readonly timeoutMs: number;
  readonly abortSignal?: AbortSignal | undefined;
  readonly timerResetIntervalMs?: number | undefined;
}): Promise<void> => {
  const { timeoutMs, abortSignal, timerResetIntervalMs } = params;
  const endDate = new Date(Date.now() + Math.max(timeoutMs, 0));

  return new Promise((resolve, reject) => {
    // biome-ignore lint/style/useConst: `timeoutId`の代入よりも先に`onAbort`などで参照するため
    let periodicResetInterval: number | NodeJS.Timeout;
    let endDateTimeout: number | NodeJS.Timeout;

    const onAbort = () => {
      clearTimeout(endDateTimeout);
      clearInterval(periodicResetInterval);
      reject(abortSignal?.reason);
    };
    abortSignal?.addEventListener('abort', onAbort);

    const onEndDate = () => {
      clearInterval(periodicResetInterval);
      abortSignal?.removeEventListener('abort', onAbort);
      resolve();
    };

    // 実行予定時刻に向けてタイマーをセットする。
    endDateTimeout = setTimeout(onEndDate, Math.max(endDate.getTime() - Date.now(), 0));

    // そのタイマーを`timerResetIntervalMs`ミリ秒ごとにリセットする。
    periodicResetInterval = setInterval(() => {
      if (endDateTimeout !== undefined) {
        clearTimeout(endDateTimeout);
      }

      endDateTimeout = setTimeout(onEndDate, Math.max(endDate.getTime() - Date.now(), 0));
    }, timerResetIntervalMs ?? 1000);
  });
};

const executeAt = async <TFunc extends () => TReturned, TReturned>(params: {
  readonly date: Date;
  readonly func: TFunc;
  readonly abortSignal?: AbortSignal | undefined;
  readonly timerResetIntervalMs?: number | undefined;
}): Promise<TReturned> => {
  const { date, func, abortSignal, timerResetIntervalMs } = params;
  const now = new Date();
  await sleep({ timeoutMs: date.getTime() - now.getTime(), abortSignal, timerResetIntervalMs });
  return func();
};
//#endregion
