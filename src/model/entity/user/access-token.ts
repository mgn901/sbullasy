import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { EmailVerificationChallengeId } from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { type Id, generateId } from '../../lib/random-values/id.ts';
import { type LongSecret, generateLongSecret } from '../../lib/random-values/long-secret.ts';
import type { FieldsOf, PickEssential, PreApplied, TypedInstance } from '../../lib/type-utils.ts';
import type { UserId } from './values.ts';

//#region AccessTokenConfigurationMap
export interface AccessTokenConfigurationMap extends ContextMap {
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
  public readonly attemptedAt: Date;

  //#region constructors
  public constructor(params: FieldsOf<AccessTokenBase>) {
    this.id = params.id;
    this[accessTokenSecretSymbol] = params[accessTokenSecretSymbol];
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.logInUserId = params.logInUserId;
    this.attemptedAt = params.attemptedAt;
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
    P & {
      readonly id: AccessTokenId;
      readonly [accessTokenSecretSymbol]: AccessTokenSecret;
      readonly attemptedAt: Date;
    }
  > {
    return AccessTokenLogInRequested.from({
      ...params,
      id: generateId() as AccessTokenId,
      [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
      attemptedAt: new Date(),
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
  >(
    this: T,
    params: P,
  ): TypedInstance<
    AccessTokenValid,
    T & { readonly [accessTokenSecretSymbol]: AccessTokenSecret }
  > {
    return AccessTokenValid.from({
      ...this,
      [accessTokenSecretSymbol]: generateLongSecret(),
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
    this.expiredAt = params.expiredAt;
    this.status = params.status;
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
            readonly attemptedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
      readonly orderBy:
        | { readonly id: 'asc' | 'desc' }
        | { readonly ipAddress: 'asc' | 'desc' }
        | { readonly userAgent: 'asc' | 'desc' }
        | { readonly logInUserId: 'asc' | 'desc' }
        | { readonly attemptedAt: 'asc' | 'desc' };
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly AccessToken[] | readonly []>;

  count(
    this: AccessTokenRepository,
    params: {
      readonly filters?:
        | {
            readonly ipAddress?: string | undefined;
            readonly userAgent?: string | undefined;
            readonly logInUserId?: UserId | undefined;
            readonly attemptedAt?:
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

//#region AccessTokenService
export interface AccessTokenServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly contextRepository: ContextRepository<AccessTokenConfigurationMap>;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
}

/**
 * 自分自身のユーザアカウントに関連するアクセストークンを取得する。
 */
export const getAccessTokens = async (
  params: {
    readonly orderBy: { readonly attemptedAt: 'asc' | 'desc' };
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & AccessTokenServiceDependencies,
): Promise<readonly AccessToken[] | readonly []> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  // TODO: デフォルトの制限
  return params.accessTokenRepository.getMany({
    filters: { logInUserId: userAccount.id },
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit,
  });
};

/**
 * クライアントが使用しているアクセストークンの有効期限を延長して、新しいシークレットと有効期限を返す。
 */
export const extendExpirationDate = async (
  params: AccessTokenServiceDependencies,
): Promise<{ readonly [accessTokenSecretSymbol]: AccessTokenSecret; readonly expiredAt: Date }> => {
  const { accessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const accessTokenExpirationDateExtended = accessToken.toExpirationDateExtended({
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });
  await params.accessTokenRepository.updateOne(accessTokenExpirationDateExtended);

  return {
    [accessTokenSecretSymbol]: accessTokenExpirationDateExtended[accessTokenSecretSymbol],
    expiredAt: accessTokenExpirationDateExtended.expiredAt,
  };
};

/**
 * 指定されたIDのアクセストークンを無効化する。
 *
 * @throws アクセストークンが見つからない場合、またはアクセストークンが自分自身以外のユーザのものである場合は、{@linkcode Exception}（`accessToken.notExists`）を返す。
 */
export const manuallyExpire = async (
  params: { readonly id: AccessTokenId } & AccessTokenServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const accessToken = await params.accessTokenRepository.getOneById(params.id);
  if (
    accessToken instanceof AccessTokenValid === false ||
    accessToken.logInUserId !== userAccount.id
  ) {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  const accessTokenManuallyExpired = accessToken.toManuallyExpired();
  await params.accessTokenRepository.updateOne(accessTokenManuallyExpired);
};

/**
 * ログアウトする（クライアントが使用しているアクセストークンを無効化する）。
 */
export const logOut = async (params: AccessTokenServiceDependencies): Promise<void> => {
  const { accessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const accessTokenManuallyExpired = accessToken.toManuallyExpired();
  await params.accessTokenRepository.updateOne(accessTokenManuallyExpired);
};
//#endregion
