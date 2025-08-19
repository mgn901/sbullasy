type ExceptionName =
  | 'userAccount.notExists'
  | 'userAccountEmailAddressUpdate.verificationCodeIncorrect'
  | 'userAccountEmailAddressUpdate.notExists'
  | 'certifiedUserProfile.notExists'
  | 'userCertification.notExists'
  | 'userCertification.alreadyCertified'
  | 'userCertification.emailAddressRejected'
  | 'userCertification.verificationCodeIncorrect'
  | 'userCertification.notLeftAllGroupsYet'
  | 'accessToken.notExists'
  | 'authentication.notExists'
  | 'authentication.verificationCodeIncorrect'
  | 'authentication.tooManyRequests'
  | 'group.notExists'
  | 'group.deletingInstanceAdmin'
  | 'groupInvitation.notExists'
  | 'groupInvitation.alreadyExists'
  | 'groupInvitation.invitationCodeIncorrect'
  | 'groupMember.deletingOnlyOneAdmin'
  | 'permission.notExists'
  | 'badgeType.notExists'
  | 'item.notExists'
  | 'item.propertiesInvalid'
  | 'file.notExists'
  | 'file.mimeTypeInvalid'
  | 'emailVerification.notExists'
  | 'accessControl.notAuthorized'
  | 'accessControl.notCertified'
  | 'accessControl.notGroupMember'
  | 'accessControl.notGroupAdmin'
  | 'accessControl.notInstanceAdmin'
  | 'accessControl.notPermitted';

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
    return new Exception(params);
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
