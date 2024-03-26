import type { IEmailVerificationChallengeProperties } from '../user-email-verification-directory/EmailVerificationChallenge.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TEmail } from '../values/TEmail.ts';

const emailVerificationPassedCertificateTypeSymbol = Symbol(
  'emailVerificationPassedCertificateTypeSymbol',
);

export interface IEmailVerificationPassedCertificateProperties {
  readonly userId: IUserProperties['id'];
  readonly email: TEmail;
  readonly purpose: IEmailVerificationChallengeProperties['purpose'];
}

export class EmailVerificationPassedCertificate<
  UserId extends IEmailVerificationPassedCertificateProperties['userId'],
  Email extends IEmailVerificationPassedCertificateProperties['email'],
  Purpose extends IEmailVerificationPassedCertificateProperties['purpose'],
> {
  public readonly [emailVerificationPassedCertificateTypeSymbol]: unknown;
  public readonly userId: UserId;
  public readonly email: Email;
  public readonly purpose: Purpose;

  public static fromParam<
    UserId extends IEmailVerificationPassedCertificateProperties['userId'],
    Email extends IEmailVerificationPassedCertificateProperties['email'],
    Purpose extends IEmailVerificationPassedCertificateProperties['purpose'],
  >(
    param: Pick<
      EmailVerificationPassedCertificate<UserId, Email, Purpose>,
      keyof IEmailVerificationPassedCertificateProperties
    >,
  ) {
    return new EmailVerificationPassedCertificate(param);
  }

  private constructor(
    param: Pick<
      EmailVerificationPassedCertificate<UserId, Email, Purpose>,
      keyof IEmailVerificationPassedCertificateProperties
    >,
  ) {
    this.userId = param.userId;
    this.email = param.email;
    this.purpose = param.purpose;
  }
}
