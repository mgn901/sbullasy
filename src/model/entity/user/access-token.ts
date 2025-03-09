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

/**
 * アクセストークンを表す。
 *
 * この型のオブジェクトはログインの試行が開始される際に作成される。
 *
 * ユーザが認証試行を完了させると、アクセストークンのシークレットを得ることができる。
 * ユーザは、アクセストークンのシークレットを送信することで、自分が認証を完了させたユーザであることを知らせることができる。
 * サービスは、アクセストークンのシークレットを受け取り、{@linkcode AccessTokenRepository.getOneBySecret}を用いてアクセストークンを取得し、その有効性を確認することで、どのユーザがログインしているのかを知ることができる。
 */
export type AccessToken = AccessTokenLogInRequested | AccessTokenValid | AccessTokenExpired;

abstract class AccessTokenBase {
  public readonly id: AccessTokenId;
  public readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  public readonly ipAddress: string;
  public readonly userAgent: string;
  public readonly logInUserId: UserId;

  //#region constructors
  public constructor(params: FieldsOf<AccessTokenBase>) {
    this.id = params.id;
    this[accessTokenSecretSymbol] = params[accessTokenSecretSymbol];
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.logInUserId = params.logInUserId;
  }
  //#endregion
}

/**
 * ログイン試行完了前のアクセストークンを表す。
 */
export class AccessTokenLogInRequested extends AccessTokenBase {
  public readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;

  /**
   * 新しいアクセストークンを作成する。
   */
  public static create<
    P extends {
      readonly ipAddress: TIpAddress;
      readonly userAgent: TUserAgent;
      readonly associatedEmailVerificationChallengeId: TAssociatedEmailVerificationChallengeId;
      /** そのアクセストークンがどのユーザのものであるのか。 */
      readonly logInUserId: TLogInUserId;
    },
    TIpAddress extends string,
    TUserAgent extends string,
    TLogInUserId extends UserId,
    TAssociatedEmailVerificationChallengeId extends EmailVerificationChallengeId,
  >(
    this: unknown,
    params: P,
  ): TypedInstance<
    AccessTokenLogInRequested,
    P & { readonly id: AccessTokenId; readonly [accessTokenSecretSymbol]: AccessTokenSecret }
  > {
    return AccessTokenLogInRequested.from({
      ...params,
      id: generateId() as AccessTokenId,
      [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
    });
  }

  /**
   * このアクセストークンをログイン試行完了後のアクセストークンにして返す。
   */
  public toLogInCompleted<
    P extends { readonly expiredAfterMs: number },
    T extends AccessTokenLogInRequested,
  >(
    this: T,
    params: P,
  ): TypedInstance<AccessTokenValid, T & { readonly loggedInAt: Date; readonly expiredAt: Date }> {
    const loggedInAt = new Date();

    return AccessTokenValid.from({
      ...this,
      loggedInAt: loggedInAt,
      expiredAt: new Date(loggedInAt.getTime() + params.expiredAfterMs),
    });
  }

  /**
   * このアクセストークンをログイン試行中止後のアクセストークンにして返す。
   */
  public toLogInCanceled<T extends AccessTokenLogInRequested>(
    this: T,
  ): TypedInstance<
    AccessTokenExpired,
    T & { readonly expiredAt: Date; readonly status: 'logInCanceled' }
  > {
    return AccessTokenExpired.from({ ...this, expiredAt: new Date(), status: 'logInCanceled' });
  }

  //#region constructors
  public static from<P extends FieldsOf<AccessTokenLogInRequested>>(
    params: PickEssential<P, keyof FieldsOf<AccessTokenLogInRequested>>,
  ): TypedInstance<AccessTokenLogInRequested, P> {
    return new AccessTokenLogInRequested(params) as TypedInstance<AccessTokenLogInRequested, P>;
  }

  private constructor(params: FieldsOf<AccessTokenLogInRequested>) {
    super(params);
    this.associatedEmailVerificationChallengeId = params.associatedEmailVerificationChallengeId;
  }
  //#endregion
}

/**
 * ログイン完了後のアクセストークンを表す。
 */
export class AccessTokenValid extends AccessTokenBase {
  public readonly loggedInAt: Date;
  public readonly expiredAt: Date;

  /**
   * このアクセストークンの期限を延長する。
   */
  public toExpirationDateExtended<
    P extends { readonly expiredAfterMs: number },
    T extends AccessTokenValid,
  >(this: T, params: P): TypedInstance<AccessTokenValid, T> {
    return AccessTokenValid.from({
      ...this,
      expiredAt: new Date(Date.now() + params.expiredAfterMs),
    });
  }

  /**
   * このアクセストークンを無効にしたものを返す。
   */
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
    this.loggedInAt = params.loggedInAt;
    this.expiredAt = params.expiredAt;
  }
  //#endregion
}

/**
 * 無効化された後のアクセストークンを表す。
 */
export class AccessTokenExpired extends AccessTokenBase {
  public readonly expiredAt: Date;
  public readonly status: 'logInCanceled' | 'automaticallyExpired' | 'manuallyExpired';

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

/**
 * {@linkcode AccessToken}を永続化するリポジトリ。
 */
export interface AccessTokenRepository {
  getOneById<TId extends AccessTokenId>(
    this: AccessTokenRepository,
    id: TId,
  ): Promise<(AccessToken & { readonly id: TId }) | undefined>;

  getOneBySecret<TSecret extends AccessTokenSecret>(
    this: AccessTokenRepository,
    secret: TSecret,
  ): Promise<(AccessToken & { readonly [accessTokenSecretSymbol]: TSecret }) | undefined>;

  getMany(
    this: AccessTokenRepository,
    params: {
      readonly filters?:
        | {
            readonly ipAddress?: string | undefined;
            readonly userAgent?: string | undefined;
            readonly logInUserId?: UserId | undefined;
            readonly loggedInAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly expiredAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
      readonly orderBy:
        | { readonly id: 'asc' | 'desc' }
        | { readonly ipAddress: 'asc' | 'desc' }
        | { readonly userAgent: 'asc' | 'desc' }
        | { readonly logInUserId: 'asc' | 'desc' }
        | { readonly loggedInAt: 'asc' | 'desc' }
        | { readonly expiredAt: 'asc' | 'desc' };
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly AccessTokenRepository[] | readonly []>;

  count(
    this: AccessTokenRepository,
    params: {
      readonly filters?:
        | {
            readonly ipAddress?: string | undefined;
            readonly userAgent?: string | undefined;
            readonly logInUserId?: UserId | undefined;
            readonly loggedInAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly expiredAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
    },
  ): Promise<number>;

  createOne(this: AccessTokenRepository, accessToken: AccessToken): Promise<void>;

  updateOne(this: AccessTokenRepository, accessToken: AccessToken): Promise<void>;

  deleteOneById(this: AccessTokenRepository, id: AccessTokenId): Promise<void>;
}
//#endregion
