import { generateId } from '../../model/lib/random-values/id.ts';
import type { Request, Response } from './Message.ts';
import type { Terminal } from './Terminal.ts';

export class Client<TFunc extends (this: unknown, ...args: never[]) => TReturned, TReturned> {
  private terminal: Terminal<Request<TFunc, TReturned>, Response<TFunc, TReturned>>;
  private responseHandlers: Map<
    Request<TFunc, TReturned>['id'],
    (returned: TReturned) => void | Promise<void>
  >;

  public async request<T extends Client<TFunc, TReturned>>(
    this: T,
    ...args: Readonly<Parameters<TFunc>>
  ): Promise<TReturned> {
    const request: Request<TFunc, TReturned> = {
      id: generateId() as Request<TFunc, TReturned>['id'],
      args,
    };
    this.terminal.post(request);
    return new Promise<TReturned>((resolve, reject) => {
      this.responseHandlers.set(request.id, resolve);
    });
  }

  public constructor(params: {
    readonly terminal: Terminal<Request<TFunc, TReturned>, Response<TFunc, TReturned>>;
  }) {
    this.terminal = params.terminal;
    this.responseHandlers = new Map();

    this.terminal.addListener((response) => {
      const responseHandler = this.responseHandlers.get(response.id);
      if (responseHandler !== undefined) {
        responseHandler(response.returned);
        this.responseHandlers.delete(response.id);
      }
    });
  }
}
