import type { TNominalPrimitive } from '../../utils/primitive.ts';
import { type TId, generateId } from '../../utils/random-values/id.ts';
import { Success } from '../../utils/result.ts';
import type { EmailVerificationPassedCertificate } from '../certificates/EmailVerificationPassedCertificate.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { UserAccount } from '../user-account/UserAccount.ts';
import { BookmarkDirectory } from '../user-bookmark-directory/BookmarkDirectory.ts';
import { EmailVerificationDirectory } from '../user-email-verification-directory/EmailVerificationDirectory.ts';
import type { TEmail } from '../values/TEmail.ts';

const userTypeSymbol = Symbol('userTypeSymbol');

export interface IUserProperties {
  readonly id: TNominalPrimitive<TId, typeof userTypeSymbol>;
  readonly email: TEmail;
  readonly createdAt: Date;
}

export class User<
  Id extends IUserProperties['id'] = IUserProperties['id'],
  Email extends IUserProperties['email'] = IUserProperties['email'],
  CreatedAt extends IUserProperties['createdAt'] = IUserProperties['createdAt'],
> {
  public readonly [userTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly email: Email;
  public readonly createdAt: CreatedAt;

  public static create<
    Email extends IUserProperties['email'],
    Id extends IUserProperties['id'] = IUserProperties['id'],
  >(param: {
    readonly email: Email;
  }): Success<{
    readonly user: User<Id, Email, IUserProperties['createdAt']>;
    readonly userAccount: UserAccount<Id, readonly []>;
    readonly emailVerificationDirectory: EmailVerificationDirectory<Id, readonly []>;
    readonly bookmarkDirectory: BookmarkDirectory<Id, readonly []>;
  }> {
    const id = generateId() as Id;

    return new Success({
      user: User.fromParam({
        id,
        email: param.email,
        createdAt: new Date(),
      }),
      userAccount: UserAccount.fromParam({
        id,
        authenticationTokens: [] as const,
      }),
      emailVerificationDirectory: EmailVerificationDirectory.fromParam({
        id,
        emailVerificationChallenges: [] as const,
      }),
      bookmarkDirectory: BookmarkDirectory.fromParam({
        id,
        bookmarks: [] as const,
      }),
    });
  }

  public toEmailSet<NewEmail extends IUserProperties['email']>(param: {
    readonly email: NewEmail;
    readonly myselfCertificate: MyselfCertificate<Id>;
    readonly emailVerificationPassedCertificate: EmailVerificationPassedCertificate<
      Id,
      NewEmail,
      'user:email:set'
    >;
  }): Success<{
    readonly user: User<Id, NewEmail, CreatedAt>;
  }> {
    return new Success({
      user: User.fromParam({
        id: this.id,
        createdAt: this.createdAt,
        email: param.email,
      }),
    });
  }

  public static fromParam<
    Id extends IUserProperties['id'],
    Email extends IUserProperties['email'],
    CreatedAt extends IUserProperties['createdAt'],
  >(param: Pick<User<Id, Email, CreatedAt>, keyof IUserProperties>): User<Id, Email, CreatedAt> {
    return new User(param);
  }

  private constructor(param: Pick<User<Id, Email, CreatedAt>, keyof IUserProperties>) {
    this.id = param.id;
    this.email = param.email;
    this.createdAt = param.createdAt;
  }
}
