export class ApplicationErrorOrException extends Error {
  public name = 'ApplicationErrorOrException';
  public readonly isProbablyCausedByClientBug: boolean;
  public readonly isProbablyCausedByServerBug: boolean;

  public constructor(param: {
    readonly message: string;
    readonly isProbablyCausedByClientBug?: boolean;
    readonly isProbablyCausedByServerBug?: boolean;
  }) {
    super(param.message);
    this.isProbablyCausedByClientBug = param.isProbablyCausedByClientBug ?? false;
    this.isProbablyCausedByServerBug = param.isProbablyCausedByServerBug ?? false;
  }
}
