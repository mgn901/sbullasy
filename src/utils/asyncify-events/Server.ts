import type { Request, Response } from './Message.ts';
import type { Terminal } from './Terminal.ts';

export class Server<TFunc extends (this: unknown, ...args: never[]) => TReturned, TReturned> {
  private terminal: Terminal<Response<TFunc, TReturned>, Request<TFunc, TReturned>>;

  public constructor(params: {
    readonly terminal: Terminal<Response<TFunc, TReturned>, Request<TFunc, TReturned>>;
    readonly func: TFunc;
  }) {
    this.terminal = params.terminal;

    this.terminal.addListener(async (request) => {
      const returned = await params.func(...request.args);
      this.terminal.post({ id: request.id, returned: returned });
    });
  }
}
