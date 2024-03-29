import { exclude } from '../../utils/predicate.ts';
import { generateId } from '../../utils/random-values/id.ts';
import { generateLongSecret } from '../../utils/random-values/long-secret.ts';
import { Success } from '../../utils/result.ts';
import type { TExcludeFromTuple } from '../../utils/tuple.ts';
import type {
  EmailVerificationPassedCertificate,
  IEmailVerificationPassedCertificateProperties,
} from '../certificates/EmailVerificationPassedCertificate.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { AUTHENTICATION_TOKEN_EXPIRATION_MS } from '../constants.ts';
import type { IUserProperties } from '../user/User.ts';
import { AuthenticationToken, type IAuthenticationTokenProperties } from './AuthenticationToken.ts';

const userAccountTypeSymbol = Symbol('userAccountTypeSymbol');

export interface IUserAccountProperties {
  readonly id: IUserProperties['id'];
  readonly authenticationTokens: readonly AuthenticationToken[];
}

export class UserAccount<
  Id extends IUserAccountProperties['id'] = IUserAccountProperties['id'],
  AuthenticationTokens extends
    IUserAccountProperties['authenticationTokens'] = IUserAccountProperties['authenticationTokens'],
> {
  public readonly [userAccountTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly authenticationTokens: AuthenticationTokens;

  public toAuthenticationTokenCreated<
    IPAddress extends IAuthenticationTokenProperties['ipAddress'],
    UserAgent extends IAuthenticationTokenProperties['userAgent'],
  >(param: {
    readonly ipAddress: IPAddress;
    readonly userAgent: UserAgent;
    readonly emailVerificationPassedCertificate: EmailVerificationPassedCertificate<
      Id,
      IEmailVerificationPassedCertificateProperties['email'],
      'userAccount:authenticationTokens:create'
    >;
  }): Success<{
    readonly userAccount: UserAccount<
      Id,
      readonly [
        ...AuthenticationTokens,
        AuthenticationToken<
          IAuthenticationTokenProperties['id'],
          Id,
          IAuthenticationTokenProperties['secret'],
          IAuthenticationTokenProperties['createdAt'],
          IAuthenticationTokenProperties['expiresAt'],
          IPAddress,
          UserAgent
        >,
      ]
    >;
    readonly authenticationToken: AuthenticationToken<
      IAuthenticationTokenProperties['id'],
      Id,
      IAuthenticationTokenProperties['secret'],
      IAuthenticationTokenProperties['createdAt'],
      IAuthenticationTokenProperties['expiresAt'],
      IPAddress,
      UserAgent
    >;
  }> {
    const authenticationToken = AuthenticationToken.fromParam({
      id: generateId() as IAuthenticationTokenProperties['id'],
      userId: this.id,
      secret: generateLongSecret(),
      createdAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + AUTHENTICATION_TOKEN_EXPIRATION_MS),
      ipAddress: param.ipAddress,
      userAgent: param.userAgent,
    });

    return new Success({
      userAccount: UserAccount.fromParam({
        id: this.id,
        authenticationTokens: [...this.authenticationTokens, authenticationToken] as const,
      }),
      authenticationToken,
    });
  }

  public toAuthenticationTokenDeleted<
    AuthenticationTokenId extends IAuthenticationTokenProperties['id'],
  >(param: {
    readonly id: AuthenticationTokenId;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly userAccount: UserAccount<
      Id,
      TExcludeFromTuple<AuthenticationTokens, AuthenticationToken<AuthenticationTokenId>>
    >;
  }> {
    return new Success({
      userAccount: UserAccount.fromParam({
        id: this.id,
        authenticationTokens: this.authenticationTokens.filter(
          exclude<AuthenticationToken, AuthenticationToken<AuthenticationTokenId>>({
            id: param.id,
          }),
        ),
      }),
    });
  }

  public static fromParam<
    Id extends IUserAccountProperties['id'],
    AuthenticationTokens extends IUserAccountProperties['authenticationTokens'],
  >(
    param: Pick<UserAccount<Id, AuthenticationTokens>, keyof IUserAccountProperties>,
  ): UserAccount<Id, AuthenticationTokens> {
    return new UserAccount(param);
  }

  private constructor(
    param: Pick<UserAccount<Id, AuthenticationTokens>, keyof IUserAccountProperties>,
  ) {
    this.id = param.id;
    this.authenticationTokens = param.authenticationTokens;
  }
}
