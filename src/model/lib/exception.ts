type ExceptionName =
  | 'userAccount.notExists'
  | 'userAccount.verificationCodeIncorrect'
  | 'userAccount.emailAddressUpdateNotStarted'
  | 'authentication.notExists'
  | 'authentication.verificationCodeIncorrect'
  | 'authentication.tooManyRequests'
  | 'accessControl.notAuthorized';

/** アプリケーションの例外を表す。 */
export class Exception<TExceptionName extends ExceptionName> extends Error {
  static {
    Exception.prototype.name = 'Exception';
  }

  public readonly exceptionName: TExceptionName;

  /** 新しい例外を作成して返す。 */
  public static create<TExceptionName extends ExceptionName>(params: {
    readonly message?: string;
    readonly exceptionName: TExceptionName;
  }): Exception<TExceptionName> {
    return Exception.create(params);
  }

  //#region constructors
  private constructor(params: {
    readonly message?: string;
    readonly exceptionName: TExceptionName;
  }) {
    super(params.message);
    this.exceptionName = params.exceptionName;
  }
  //#endregion
}
