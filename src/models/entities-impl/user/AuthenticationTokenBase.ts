import { IAuthenticationToken } from '../../entities/user/IAuthenticationToken.ts';
import { TLongSecret } from '../../values/TLongSecret.ts';

/**
 * {@linkcode IAuthenticationToken}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class AuthenticationTokenBase implements IAuthenticationToken {
  public readonly __brand = 'IAuthenticationToken';

  public readonly id: IAuthenticationToken['id'];

  public readonly type: IAuthenticationToken['type'];

  public readonly createdAt: IAuthenticationToken['createdAt'];

  public readonly expiresAt: IAuthenticationToken['expiresAt'];

  public readonly ipAddress: IAuthenticationToken['ipAddress'];

  public readonly userAgent: IAuthenticationToken['userAgent'];

  public readonly ownerId: IAuthenticationToken['ownerId'];

  private readonly _secret: TLongSecret;

  public constructor(
    authenticationToken: Pick<
      IAuthenticationToken,
      'id' | 'type' | 'createdAt' | 'expiresAt' | 'ipAddress' | 'userAgent' | 'ownerId'
    > & { _secret: TLongSecret },
  ) {
    this.id = authenticationToken.id;
    this._secret = authenticationToken._secret;
    this.type = authenticationToken.type;
    this.createdAt = authenticationToken.createdAt;
    this.expiresAt = authenticationToken.expiresAt;
    this.ipAddress = authenticationToken.ipAddress;
    this.userAgent = authenticationToken.userAgent;
    this.ownerId = authenticationToken.ownerId;
  }

  public isValidAt(date: Date): boolean {
    return date < this.expiresAt;
  }

  public dangerouslyGetSecret(): TLongSecret {
    return this._secret;
  }
}
