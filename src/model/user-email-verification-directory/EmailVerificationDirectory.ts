import { exclude, extract } from '../../utils/predicate.ts';
import { generateId } from '../../utils/random-values/id.ts';
import { type TShortSecret, generateShortSecret } from '../../utils/random-values/short-secret.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { TExcludeFromTuple } from '../../utils/tuple.ts';
import {
  EmailVerificationPassedCertificate,
  type IEmailVerificationPassedCertificateProperties,
} from '../certificates/EmailVerificationPassedCertificate.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { EMAIL_VERIFICATION_CHALLENGE_EXPIRATION_MS } from '../constants.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { NotFoundException } from '../errors/NotFoundException.ts';
import type { IUserProperties, User } from '../user/User.ts';
import {
  EmailVerificationChallenge,
  type IEmailVerificationChallengeProperties,
} from './EmailVerificationChallenge.ts';

const emailVerificationDirectoryTypeSymbol = Symbol('emailVerificationDirectoryTypeSymbol');

export interface IEmailVerificationDirectoryProperties {
  readonly id: IUserProperties['id'];
  readonly emailVerificationChallenges: readonly EmailVerificationChallenge[];
}

export class EmailVerificationDirectory<
  Id extends
    IEmailVerificationDirectoryProperties['id'] = IEmailVerificationDirectoryProperties['id'],
  EmailVerificationChallenges extends
    IEmailVerificationDirectoryProperties['emailVerificationChallenges'] = IEmailVerificationDirectoryProperties['emailVerificationChallenges'],
> {
  public readonly [emailVerificationDirectoryTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly emailVerificationChallenges: EmailVerificationChallenges;

  public toEmailVerificationChallengeCreatedFromUser<
    Email extends IEmailVerificationChallengeProperties['email'],
    Purpose extends 'userAccount:authenticationTokens:create',
  >(param: {
    readonly user: User<Id, Email>;
    readonly purpose: Purpose;
  }): Success<{
    readonly emailVerificationDirectory: EmailVerificationDirectory<
      Id,
      readonly [
        ...EmailVerificationChallenges,
        EmailVerificationChallenge<
          IEmailVerificationChallengeProperties['id'],
          Id,
          Email,
          Purpose,
          IEmailVerificationChallengeProperties['secret'],
          IEmailVerificationChallengeProperties['expiresAt']
        >,
      ]
    >;
    readonly emailVerificationChallenge: EmailVerificationChallenge<
      IEmailVerificationChallengeProperties['id'],
      Id,
      Email,
      Purpose,
      IEmailVerificationChallengeProperties['secret'],
      IEmailVerificationChallengeProperties['expiresAt']
    >;
  }> {
    const emailVerificationChallenge = EmailVerificationChallenge.fromParam({
      id: generateId() as IEmailVerificationChallengeProperties['id'],
      userId: param.user.id,
      email: param.user.email,
      secret: generateShortSecret(),
      purpose: param.purpose,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_CHALLENGE_EXPIRATION_MS),
    });

    return new Success({
      emailVerificationDirectory: EmailVerificationDirectory.fromParam({
        id: this.id,
        emailVerificationChallenges: [
          ...this.emailVerificationChallenges,
          emailVerificationChallenge,
        ] as const,
      }),
      emailVerificationChallenge,
    });
  }

  public toEmailVerificationChallengeCreatedFromCustomEmail<
    Email extends IEmailVerificationChallengeProperties['email'],
    Purpose extends 'user:email:set' | 'userProfile:create',
  >(param: {
    readonly user: User<Id>;
    readonly email: Email;
    readonly purpose: Purpose;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly emailVerificationDirectory: EmailVerificationDirectory<
      Id,
      readonly [
        ...EmailVerificationChallenges,
        EmailVerificationChallenge<
          IEmailVerificationChallengeProperties['id'],
          Id,
          Email,
          Purpose,
          IEmailVerificationChallengeProperties['secret'],
          IEmailVerificationChallengeProperties['expiresAt']
        >,
      ]
    >;
    readonly emailVerificationChallenge: EmailVerificationChallenge<
      IEmailVerificationChallengeProperties['id'],
      Id,
      Email,
      Purpose,
      IEmailVerificationChallengeProperties['secret'],
      IEmailVerificationChallengeProperties['expiresAt']
    >;
  }> {
    const emailVerificationChallenge = EmailVerificationChallenge.fromParam({
      id: generateId() as IEmailVerificationChallengeProperties['id'],
      userId: param.user.id,
      email: param.email,
      secret: generateShortSecret(),
      purpose: param.purpose,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_CHALLENGE_EXPIRATION_MS),
    });

    return new Success({
      emailVerificationDirectory: EmailVerificationDirectory.fromParam({
        id: this.id,
        emailVerificationChallenges: [
          ...this.emailVerificationChallenges,
          emailVerificationChallenge,
        ] as const,
      }),
      emailVerificationChallenge,
    });
  }

  public toEmailVerificationAnswerCreated<
    EmailVerificationChallengeId extends IEmailVerificationChallengeProperties['id'],
  >(param: {
    readonly emailVerificationChallengeId: EmailVerificationChallengeId;
    readonly answer: TShortSecret;
  }): TResult<
    {
      readonly emailVerificationDirectory: EmailVerificationDirectory<
        Id,
        TExcludeFromTuple<
          EmailVerificationChallenges,
          EmailVerificationChallenge<EmailVerificationChallengeId>
        >
      >;
      readonly emailVerificationChallengePassedCertificate: EmailVerificationPassedCertificate<
        Id,
        IEmailVerificationPassedCertificateProperties['email'],
        IEmailVerificationPassedCertificateProperties['purpose']
      >;
    },
    EmailVerificationFailedException | NotFoundException
  > {
    const emailVerificationChallenge = this.emailVerificationChallenges.find(
      extract<EmailVerificationChallenge, EmailVerificationChallenge<EmailVerificationChallengeId>>(
        { id: param.emailVerificationChallengeId },
      ),
    );

    if (emailVerificationChallenge === undefined) {
      return new Failure(
        new NotFoundException({
          message: '存在しない認証に回答することはできません。',
          isProbablyCausedByClientBug: true,
        }),
      );
    }

    if (emailVerificationChallenge.secret !== param.answer) {
      return new Failure(
        new EmailVerificationFailedException({
          message: '正しい認証コードを入力してください。',
        }),
      );
    }

    return new Success({
      emailVerificationDirectory: EmailVerificationDirectory.fromParam({
        id: this.id,
        emailVerificationChallenges: this.emailVerificationChallenges.filter(
          exclude<
            EmailVerificationChallenge,
            EmailVerificationChallenge<EmailVerificationChallengeId>
          >({ id: param.emailVerificationChallengeId }),
        ),
      }),
      emailVerificationChallengePassedCertificate: EmailVerificationPassedCertificate.fromParam({
        userId: this.id,
        email: emailVerificationChallenge.email,
        purpose: emailVerificationChallenge.purpose,
      }),
    });
  }

  public static fromParam<
    Id extends IEmailVerificationDirectoryProperties['id'],
    EmailVerificationChallenges extends
      IEmailVerificationDirectoryProperties['emailVerificationChallenges'],
  >(
    param: Pick<
      EmailVerificationDirectory<Id, EmailVerificationChallenges>,
      keyof IEmailVerificationDirectoryProperties
    >,
  ): EmailVerificationDirectory<Id, EmailVerificationChallenges> {
    return new EmailVerificationDirectory(param);
  }

  private constructor(
    param: Pick<
      EmailVerificationDirectory<Id, EmailVerificationChallenges>,
      keyof IEmailVerificationDirectoryProperties
    >,
  ) {
    this.id = param.id;
    this.emailVerificationChallenges = param.emailVerificationChallenges;
  }
}

export class EmailVerificationFailedException extends ApplicationErrorOrException {
  public readonly name = 'EmailVerificationFailed';
}
