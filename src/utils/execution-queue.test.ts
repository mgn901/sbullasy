import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { type Id, generateId } from '../model/lib/random-values/id.ts';
import { Client } from './asyncify-events/Client.ts';
import { Server } from './asyncify-events/Server.ts';
import { EventTargetTerminal } from './asyncify-events/Terminal.ts';
import {
  Execution,
  ExecutionQueueWithTimeWindowRateLimitation,
  type ExecutionRepository,
} from './execution-queue.ts';

class ExecutionRepositoryMock<
  TId,
  TFunc extends (this: unknown, ...args: never[]) => TReturned,
  TReturned,
> implements ExecutionRepository<TId, TFunc, TReturned>
{
  public readonly underlyingMap = new Map<TId, Execution<TId, TFunc, TReturned>>();

  public async getOneById(id: TId): Promise<Execution<TId, TFunc, TReturned> | undefined> {
    return this.underlyingMap.get(id);
  }

  public async getMany(params: {
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
  }): Promise<readonly Execution<TId, TFunc, TReturned>[] | readonly []> {
    return (await this.getExecutionsBase(params))
      .sort(
        (a, b) =>
          (params.orderBy.executedAt === 'asc' ? 1 : -1) *
          (a.executedAt.getTime() - b.executedAt.getTime()),
      )
      .slice(
        params.offset ?? 0,
        params.limit !== undefined ? (params.offset ?? 0) + params.limit : undefined,
      );
  }

  public async count(params: {
    readonly filters?:
      | {
          readonly executedAt?:
            | { readonly from?: Date | undefined; readonly until?: Date | undefined }
            | undefined;
          readonly isExecuted?: boolean | undefined;
        }
      | undefined;
  }): Promise<number> {
    return (await this.getExecutionsBase(params)).length;
  }

  private async getExecutionsBase(params: {
    readonly filters?:
      | {
          readonly executedAt?:
            | { readonly from?: Date | undefined; readonly until?: Date | undefined }
            | undefined;
          readonly isExecuted?: boolean | undefined;
        }
      | undefined;
  }): Promise<Execution<TId, TFunc, TReturned>[]> {
    return [...this.underlyingMap.entries()]
      .filter(([_, execution]) => {
        if (
          params.filters?.executedAt?.from !== undefined &&
          execution.executedAt < params.filters.executedAt.from
        ) {
          return false;
        }

        if (
          params.filters?.executedAt?.until !== undefined &&
          params.filters.executedAt.until < execution.executedAt
        ) {
          return false;
        }

        if (
          params.filters?.isExecuted !== undefined &&
          execution.isExecuted !== params.filters.isExecuted
        ) {
          return false;
        }

        return true;
      })
      .map(([_, execution]) => execution);
  }

  public async saveOne(execution: Execution<TId, TFunc, TReturned>): Promise<void> {
    this.underlyingMap.set(execution.id, execution);
  }

  public async deleteOneById(id: TId): Promise<void> {
    this.underlyingMap.delete(id);
  }
}

const expectedExecutionDateMap = new Map<number, Date>();
const actualExecutionDateMap = new Map<number, Date>();
const me = new EventTarget();
const destination = new EventTarget();
const client = new Client<(id: number) => void, void>({
  terminal: new EventTargetTerminal({ me, destination }),
});
const server = new Server<(id: number) => void, void>({
  terminal: new EventTargetTerminal({ me: destination, destination: me }),
  func: (id: number) => {
    actualExecutionDateMap.set(id, new Date());
  },
});
const executionRepository = new ExecutionRepositoryMock<Id, (id: number) => void, void>();
const timeWindowRateLimitationRules = [
  { timeWindowMs: 5000, executionCountPerTimeWindow: 10 },
  { timeWindowMs: 10000, executionCountPerTimeWindow: 15 },
  { timeWindowMs: 20000, executionCountPerTimeWindow: 20 },
];

const executionQueue = ExecutionQueueWithTimeWindowRateLimitation.create<
  Id,
  (id: number) => void,
  void
>({
  client,
  timeWindowRateLimitationRules,
  executionFactory: Execution.createFactory({ generateId }),
  executionRepository: executionRepository,
});

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'setInterval');

beforeAll(async () => {
  for (let i = 0; i < 100; i += 1) {
    const { executedAt } = await executionQueue.enqueue([i]);
    expectedExecutionDateMap.set(i, executedAt);
  }
});

describe('ExecutionQueueWithTimeWindowRateLimitation', () => {
  describe('enqueue()', () => {
    test('Rate limitations are not exceeded', async () => {
      const executions = await executionRepository.getMany({
        orderBy: { executedAt: 'asc' },
      });

      for (const rule of timeWindowRateLimitationRules) {
        for (let i = 0; i < executions.length - rule.executionCountPerTimeWindow; i += 1) {
          const { executedAt: firstExecutionDate } = executions[i];
          const { executedAt: lastExecutionDate } =
            executions[i + rule.executionCountPerTimeWindow];

          expect(lastExecutionDate.getTime() - firstExecutionDate.getTime()).toBeGreaterThanOrEqual(
            rule.timeWindowMs,
          );
        }
      }
    });

    test('Enqueued executions are executed on time', async () => {
      await jest.advanceTimersByTimeAsync(100000);
      [...expectedExecutionDateMap.entries()].map(([id, expectedExecutionDate]) => {
        const actualExecutedDate = actualExecutionDateMap.get(id);
        expect(actualExecutedDate?.getTime()).toBeDefined();
        if (actualExecutedDate?.getTime() === undefined) {
          return;
        }
        expect(
          Math.abs(actualExecutedDate?.getTime() - expectedExecutionDate.getTime()),
        ).toBeLessThanOrEqual(1);
      });
      expect(await executionRepository.count({ filters: { isExecuted: true } })).toEqual(100);
    });
  });
});
