type ExceptionName =
  | 'userAccount.notExists'
  | 'userAccountEmailAddressUpdate.verificationCodeIncorrect'
  | 'userAccountEmailAddressUpdate.notExists'
  | 'certifiedUserProfile.notExists'
  | 'userCertification.notExists'
  | 'userCertification.alreadyCertified'
  | 'userCertification.emailAddressRejected'
  | 'userCertification.verificationCodeIncorrect'
  | 'accessToken.notExists'
  | 'authentication.notExists'
  | 'authentication.verificationCodeIncorrect'
  | 'authentication.tooManyRequests'
  | 'emailVerification.notExists'
  | 'accessControl.notAuthorized'
  | 'accessControl.notCertified';

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
