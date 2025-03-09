export interface Terminal<TRequest, TResponse> {
  post(this: Terminal<TRequest, TResponse>, request: TRequest): void;
  addListener(
    this: Terminal<TRequest, TResponse>,
    handleResponse: (this: unknown, response: TResponse) => void,
  ): void;
}

export class EventTargetTerminal<TRequest, TResponse> implements Terminal<TRequest, TResponse> {
  private me: EventTarget;
  private destination: EventTarget;

  public post(this: EventTargetTerminal<TRequest, TResponse>, request: TRequest): void {
    this.destination.dispatchEvent(new MessageEvent('message', { data: request }));
  }

  public addListener(
    this: EventTargetTerminal<TRequest, TResponse>,
    handleResponse: (this: unknown, response: TResponse) => void,
  ): void {
    const handleMessage = (event: Event | MessageEvent<TResponse>) => {
      if (event instanceof MessageEvent) {
        handleResponse(event.data as TResponse);
      }
    };

    this.me.addEventListener('message', handleMessage);
  }

  public constructor(params: { readonly me: EventTarget; readonly destination: EventTarget }) {
    this.me = params.me;
    this.destination = params.destination;
  }
}

export class MessagePortTerminal<TRequest, TResponse> implements Terminal<TRequest, TResponse> {
  private port:
    | BroadcastChannel
    | DedicatedWorkerGlobalScope
    | MessagePort
    | ServiceWorker
    | Window
    | Worker;
  private channel: string;

  public post(this: MessagePortTerminal<TRequest, TResponse>, request: TRequest): void {
    this.port.postMessage({ channel: this.channel, body: request });
  }

  public addListener(
    this: MessagePortTerminal<TRequest, TResponse>,
    handleResponse: (response: TResponse) => void,
  ): void {
    const handleMessage = (event: Event | MessageEvent<TResponse>) => {
      if (event instanceof MessageEvent && event.data.channel === this.channel) {
        handleResponse(event.data.body as TResponse);
      }
    };

    this.port.addEventListener('message', handleMessage);
  }

  public constructor(params: {
    readonly port:
      | BroadcastChannel
      | DedicatedWorkerGlobalScope
      | MessagePort
      | ServiceWorker
      | Window
      | Worker;
    readonly channel: string;
  }) {
    this.port = params.port;
    this.channel = params.channel;
  }
}
