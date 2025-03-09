import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { EmailVerificationChallengeId } from '../../lib/email-verification.ts';
import { type Id, generateId } from '../../lib/random-values/id.ts';
import { type LongSecret, generateLongSecret } from '../../lib/random-values/long-secret.ts';
import type { FieldsOf, PickEssential, TypedInstance } from '../../lib/type-utils.ts';
import type { UserId } from './values.ts';

//#region AccessTokenConfigurationMap
export interface AccessTokenConfigurationMap {
  readonly 'accessToken.expiredAfterMs': number;
}

const accessTokenConfigurationMap = {
  'accessToken.expiredAfterMs': 30 * 24 * 60 * 60 * 1000,
} as const satisfies AccessTokenConfigurationMap;
//#endregion

//#region AccessToken and AccessTokenRepository
const accessTokenTypeSymbol = Symbol();

const accessTokenSecretSymbol = Symbol();

export const accessTokenSymbol = {
  type: accessTokenTypeSymbol,
  secret: accessTokenSecretSymbol,
} as const;

export type AccessTokenId = NominalPrimitive<Id, typeof accessTokenTypeSymbol>;

export type AccessTokenSecret = NominalPrimitive<LongSecret, typeof accessTokenTypeSymbol>;

abstract class AccessTokenBase {
  public readonly id: AccessTokenId;
  public readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  public readonly ipAddress: string;
  public readonly userAgent: string;
  public readonly loginUserId: UserId;

  //#region constructors
  public constructor(params: FieldsOf<AccessTokenBase>) {
    this.id = params.id;
    this[accessTokenSecretSymbol] = params[accessTokenSecretSymbol];
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.loginUserId = params.loginUserId;
  }
  //#endregion
}

export class AccessTokenLoginRequested extends AccessTokenBase {
  public readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;

  public static create<
    P extends {
      readonly ipAddress: TIpAddress;
      readonly userAgent: TUserAgent;
      readonly associatedEmailVerificationChallengeId: TAssociatedEmailVerificationChallengeId;
      readonly loginUserId: TLoginUserId;
    },
    TIpAddress extends string,
    TUserAgent extends string,
    TLoginUserId extends UserId,
    TAssociatedEmailVerificationChallengeId extends EmailVerificationChallengeId,
  >(
    this: unknown,
    params: P,
  ): TypedInstance<
    AccessTokenLoginRequested,
    P & { readonly id: AccessTokenId; readonly [accessTokenSecretSymbol]: AccessTokenSecret }
  > {
    return AccessTokenLoginRequested.from({
      ...params,
      id: generateId() as AccessTokenId,
      [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
    });
  }

  public toLoginCompleted<
    P extends { readonly expiredAfterMs: number },
    T extends AccessTokenLoginRequested,
  >(
    this: T,
    params: P,
  ): TypedInstance<AccessTokenValid, T & { readonly createdAt: Date; readonly expiredAt: Date }> {
    const createdAt = new Date();

    return AccessTokenValid.from({
      ...this,
      createdAt,
      expiredAt: new Date(createdAt.getTime() + params.expiredAfterMs),
    });
  }

  public toLoginCanceled<T extends AccessTokenLoginRequested>(
    this: T,
  ): TypedInstance<
    AccessTokenExpired,
    T & { readonly expiredAt: Date; readonly status: 'loginCanceled' }
  > {
    return AccessTokenExpired.from({ ...this, expiredAt: new Date(), status: 'loginCanceled' });
  }

  //#region constructors
  public static from<P extends FieldsOf<AccessTokenLoginRequested>>(
    params: PickEssential<P, keyof FieldsOf<AccessTokenLoginRequested>>,
  ): TypedInstance<AccessTokenLoginRequested, P> {
    return new AccessTokenLoginRequested(params) as TypedInstance<AccessTokenLoginRequested, P>;
  }

  private constructor(params: FieldsOf<AccessTokenLoginRequested>) {
    super(params);
    this.associatedEmailVerificationChallengeId = params.associatedEmailVerificationChallengeId;
  }
  //#endregion
}

export class AccessTokenValid extends AccessTokenBase {
  public readonly createdAt: Date;
  public readonly expiredAt: Date;

  public toExpirationDateExtended<
    P extends { readonly expiredAfterMs: number },
    T extends AccessTokenValid,
  >(this: T, params: P): TypedInstance<AccessTokenValid, T> {
    return AccessTokenValid.from({
      ...this,
      expiredAt: new Date(Date.now() + params.expiredAfterMs),
    });
  }

  public toManuallyExpired<T extends AccessTokenValid>(
    this: T,
  ): TypedInstance<
    AccessTokenExpired,
    T & { readonly expiredAt: Date; readonly status: 'manuallyExpired' }
  > {
    return AccessTokenExpired.from({ ...this, expiredAt: new Date(), status: 'manuallyExpired' });
  }

  //#region constructors
  public static from<P extends FieldsOf<AccessTokenValid>>(
    params: PickEssential<P, keyof FieldsOf<AccessTokenValid>>,
  ): TypedInstance<AccessTokenValid, P> {
    return new AccessTokenValid(params) as TypedInstance<AccessTokenValid, P>;
  }

  private constructor(params: FieldsOf<AccessTokenValid>) {
    super(params);
    this.createdAt = params.createdAt;
    this.expiredAt = params.expiredAt;
  }
  //#endregion
}

export class AccessTokenExpired extends AccessTokenBase {
  public readonly expiredAt: Date;
  public readonly status: 'loginCanceled' | 'automaticallyExpired' | 'manuallyExpired';

  //#region constructors
  public static from<P extends FieldsOf<AccessTokenExpired>>(
    params: PickEssential<P, keyof FieldsOf<AccessTokenExpired>>,
  ): TypedInstance<AccessTokenExpired, P> {
    return new AccessTokenExpired(params) as TypedInstance<AccessTokenExpired, P>;
  }

  private constructor(params: FieldsOf<AccessTokenExpired>) {
    super(params);
    this.status = params.status;
    this.expiredAt = params.expiredAt;
  }
  //#endregion
}

export type AccessToken = AccessTokenLoginRequested | AccessTokenValid | AccessTokenExpired;

export interface AccessTokenRepository {
  getOneById<TId extends AccessTokenId>(
    this: AccessTokenRepository,
    id: TId,
  ): Promise<(AccessToken & { readonly id: TId }) | undefined>;

  getOneBySecret<TSecret extends AccessTokenSecret>(
    this: AccessTokenRepository,
    secret: TSecret,
  ): Promise<(AccessToken & { readonly [accessTokenSecretSymbol]: TSecret }) | undefined>;

  getMany(this: AccessTokenRepository): Promise<readonly AccessTokenRepository[] | readonly []>;

  createOne(this: AccessTokenRepository, accessToken: AccessToken): Promise<void>;

  updateOne(this: AccessTokenRepository, accessToken: AccessToken): Promise<void>;

  deleteOneById(this: AccessTokenRepository, id: AccessTokenId): Promise<void>;
}
//#endregion

//#region AccessTokenService
//#endregion
