import type { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import type { TId } from '../../utils/random-values/TId.ts';
import type { TShortSecret } from '../../utils/random-values/TShortSecret.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TEmail } from '../values/TEmail.ts';

const emailVerificationChallengeTypeSymbol = Symbol('emailVerificationChallengeTypeSymbol');

export interface IEmailVerificationChallengeProperties {
  readonly id: TNominalPrimitive<TId, typeof emailVerificationChallengeTypeSymbol>;
  readonly userId: IUserProperties['id'];
  readonly email: TEmail;
  readonly purpose:
    | 'userAccount:authenticationTokens:create'
    | 'user:email:set'
    | 'userProfile:create';
  readonly secret: TShortSecret;
  readonly expiresAt: Date;
}

export class EmailVerificationChallenge<
  Id extends
    IEmailVerificationChallengeProperties['id'] = IEmailVerificationChallengeProperties['id'],
  UserId extends
    IEmailVerificationChallengeProperties['userId'] = IEmailVerificationChallengeProperties['userId'],
  Email extends
    IEmailVerificationChallengeProperties['email'] = IEmailVerificationChallengeProperties['email'],
  Purpose extends
    IEmailVerificationChallengeProperties['purpose'] = IEmailVerificationChallengeProperties['purpose'],
  Secret extends
    IEmailVerificationChallengeProperties['secret'] = IEmailVerificationChallengeProperties['secret'],
  ExpiresAt extends
    IEmailVerificationChallengeProperties['expiresAt'] = IEmailVerificationChallengeProperties['expiresAt'],
> {
  public readonly [emailVerificationChallengeTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly userId: UserId;
  public readonly email: Email;
  public readonly purpose: Purpose;
  public readonly secret: Secret;
  public readonly expiresAt: ExpiresAt;

  public static fromParam<
    Id extends IEmailVerificationChallengeProperties['id'],
    UserId extends IEmailVerificationChallengeProperties['userId'],
    Email extends IEmailVerificationChallengeProperties['email'],
    Purpose extends IEmailVerificationChallengeProperties['purpose'],
    Secret extends IEmailVerificationChallengeProperties['secret'],
    ExpiresAt extends IEmailVerificationChallengeProperties['expiresAt'],
  >(
    param: Pick<
      EmailVerificationChallenge<Id, UserId, Email, Purpose, Secret, ExpiresAt>,
      keyof IEmailVerificationChallengeProperties
    >,
  ): EmailVerificationChallenge<Id, UserId, Email, Purpose, Secret, ExpiresAt> {
    return new EmailVerificationChallenge(param);
  }

  private constructor(
    param: Pick<
      EmailVerificationChallenge<Id, UserId, Email, Purpose, Secret, ExpiresAt>,
      keyof IEmailVerificationChallengeProperties
    >,
  ) {
    this.id = param.id;
    this.userId = param.userId;
    this.email = param.email;
    this.secret = param.secret;
    this.purpose = param.purpose;
    this.expiresAt = param.expiresAt;
  }
}
