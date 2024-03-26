import type { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import type { TId } from '../../utils/random-values/TId.ts';
import type { TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import type { IUserProperties } from '../user/User.ts';

const authenticationTokenTypeSymbol = Symbol('authenticationTokenTypeSymbol');

export interface IAuthenticationTokenProperties {
  readonly id: TNominalPrimitive<TId, typeof authenticationTokenTypeSymbol>;
  readonly userId: IUserProperties['id'];
  readonly secret: TLongSecret;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly ipAddress: string;
  readonly userAgent: string;
}

export class AuthenticationToken<
  Id extends IAuthenticationTokenProperties['id'] = IAuthenticationTokenProperties['id'],
  UserId extends
    IAuthenticationTokenProperties['userId'] = IAuthenticationTokenProperties['userId'],
  Secret extends
    IAuthenticationTokenProperties['secret'] = IAuthenticationTokenProperties['secret'],
  CreatedAt extends
    IAuthenticationTokenProperties['createdAt'] = IAuthenticationTokenProperties['createdAt'],
  ExpiresAt extends
    IAuthenticationTokenProperties['expiresAt'] = IAuthenticationTokenProperties['expiresAt'],
  IPAddress extends
    IAuthenticationTokenProperties['ipAddress'] = IAuthenticationTokenProperties['ipAddress'],
  UserAgent extends
    IAuthenticationTokenProperties['userAgent'] = IAuthenticationTokenProperties['userAgent'],
> {
  public readonly [authenticationTokenTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly userId: UserId;
  public readonly secret: Secret;
  public readonly createdAt: CreatedAt;
  public readonly expiresAt: ExpiresAt;
  public readonly ipAddress: IPAddress;
  public readonly userAgent: UserAgent;

  public static fromParam<
    Id extends IAuthenticationTokenProperties['id'],
    UserId extends IAuthenticationTokenProperties['userId'],
    Secret extends IAuthenticationTokenProperties['secret'],
    CreatedAt extends IAuthenticationTokenProperties['createdAt'],
    ExpiresAt extends IAuthenticationTokenProperties['expiresAt'],
    IPAddress extends IAuthenticationTokenProperties['ipAddress'],
    UserAgent extends IAuthenticationTokenProperties['userAgent'],
  >(
    param: Pick<
      AuthenticationToken<Id, UserId, Secret, CreatedAt, ExpiresAt, IPAddress, UserAgent>,
      keyof IAuthenticationTokenProperties
    >,
  ): AuthenticationToken<Id, UserId, Secret, CreatedAt, ExpiresAt, IPAddress, UserAgent> {
    return new AuthenticationToken(param);
  }

  private constructor(
    param: Pick<
      AuthenticationToken<Id, UserId, Secret, CreatedAt, ExpiresAt, IPAddress, UserAgent>,
      keyof IAuthenticationTokenProperties
    >,
  ) {
    this.id = param.id;
    this.userId = param.userId;
    this.secret = param.secret;
    this.createdAt = param.createdAt;
    this.expiresAt = param.expiresAt;
    this.ipAddress = param.ipAddress;
    this.userAgent = param.userAgent;
  }
}
