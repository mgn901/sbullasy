type ExceptionName =
  | 'userAccount.notExists'
  | 'userAccount.verificationCodeIncorrect'
  | 'authentication.notExists'
  | 'authentication.verificationCodeIncorrect'
  | 'authentication.tooManyRequests'
  | 'accessControl.notAuthorized';

export class Exception<TExceptionName extends ExceptionName> extends Error {
  static {
    Exception.prototype.name = 'Exception';
  }

  public readonly exceptionName: TExceptionName;

  public constructor(params: {
    readonly message?: string;
    readonly exceptionName: TExceptionName;
  }) {
    super(params.message);
    this.exceptionName = params.exceptionName;
  }
}
