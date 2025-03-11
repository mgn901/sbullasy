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
import { Exception } from '../../lib/exception.ts';
import { type Id, generateId } from '../../lib/random-values/id.ts';
import { type LongSecret, generateLongSecret } from '../../lib/random-values/long-secret.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
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
const accessTokenTypeSymbol = Symbol('accessToken.type');

const accessTokenSecretSymbol = Symbol('accessToken.secret');

export const accessTokenSymbol = {
  type: accessTokenTypeSymbol,
  secret: accessTokenSecretSymbol,
} as const;

export type AccessTokenId = NominalPrimitive<Id, typeof accessTokenTypeSymbol>;

export type AccessTokenSecret = NominalPrimitive<LongSecret, typeof accessTokenTypeSymbol>;

/**
 * アクセストークンを表す。
 *
 * ユーザが認証試行を完了させると、アクセストークンのシークレットを得ることができる。
 * ユーザは、アクセストークンのシークレットを送信することで、自分が認証を完了させたユーザであることを知らせることができる。
 * サービスは、アクセストークンのシークレットを受け取り、{@linkcode AccessTokenRepository.getOneBySecret}を用いてアクセストークンを取得し、その有効性を確認することで、どのユーザがログインしているのかを知ることができる。
 */
export type AccessToken = {
  readonly [accessTokenTypeSymbol]: typeof accessTokenTypeSymbol;
  readonly id: AccessTokenId;
  readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  readonly logInUserId: UserId;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly loggedInAt: Date;
  readonly lastUsedAt: Date;
  readonly expiredAt: Date;
  readonly status: 'valid' | 'expired' | 'revoked';
};

/**
 * {@linkcode AccessToken}の状態を変更するための関数を提供する。
 */
export const AccessTokenReducers = {
  /**
   * 新しいアクセストークンを作成して返す。
   */
  create: <
    P extends {
      readonly logInUserId: TUserId;
      readonly ipAddress: TIpAddress;
      readonly userAgent: TUserAgent;
      readonly expiredAfterMs: number;
    },
    TUserId extends UserId,
    TIpAddress extends string,
    TUserAgent extends string,
  >(
    params: P,
  ): AccessToken & { readonly status: 'valid' } & Pick<
      P,
      'logInUserId' | 'ipAddress' | 'userAgent'
    > => {
    const loggedInAt = new Date();
    return {
      [accessTokenTypeSymbol]: accessTokenTypeSymbol,
      id: generateId() as AccessTokenId,
      [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
      logInUserId: params.logInUserId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      loggedInAt: loggedInAt,
      expiredAt: new Date(loggedInAt.getTime() + params.expiredAfterMs),
      lastUsedAt: loggedInAt,
      status: 'valid',
    } as const;
  },

  /**
   * 指定されたアクセストークンの有効期限を、指定された期間だけ延長し、シークレットの値を更新して返す。
   * @param self 有効期限を延長するアクセストークン
   */
  toExpirationDateExtended: <
    S extends AccessToken & { readonly status: 'valid' },
    P extends { readonly expiredAfterMs: number },
  >(
    self: S,
    params: P,
  ): S & { readonly [accessTokenSecretSymbol]: AccessTokenSecret; readonly expiredAt: Date } =>
    ({
      ...self,
      [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
      expiredAt: new Date(Date.now() + params.expiredAfterMs),
    }) as const,

  /**
   * 指定されたアクセストークンを無効にして返す。
   * @param self 無効にするアクセストークン
   */
  toRevoked: <S extends AccessToken & { readonly status: 'valid' }>(
    self: S,
  ): Omit<S, 'status'> & { readonly status: 'revoked' } =>
    ({ ...self, status: 'revoked' }) as const,

  isValid: <S extends AccessToken>(self: S): self is S & { readonly status: 'valid' } =>
    self.status === 'valid',
};

/**
 * {@linkcode AccessToken}を永続化するリポジトリ。
 */
export interface AccessTokenRepository {
  getOneById<TId extends AccessTokenId>(
    this: AccessTokenRepository,
    id: TId,
  ): Promise<FromRepository<AccessToken & { readonly id: TId }> | undefined>;

  getOneBySecret<TSecret extends AccessTokenSecret>(
    this: AccessTokenRepository,
    secret: TSecret,
  ): Promise<
    FromRepository<AccessToken & { readonly [accessTokenSecretSymbol]: TSecret }> | undefined
  >;

  getMany(
    this: AccessTokenRepository,
    params: {
      readonly filters?: Filters<AccessToken>;
      readonly orderBy: OrderBy<AccessToken>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<AccessToken>[] | readonly []>;

  count(
    this: AccessTokenRepository,
    params: { readonly filters?: Filters<AccessToken> },
  ): Promise<number>;

  createOne(this: AccessTokenRepository, accessToken: AccessToken): Promise<void>;

  updateOne(this: AccessTokenRepository, accessToken: FromRepository<AccessToken>): Promise<void>;

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
    readonly filters?: Filters<Pick<AccessToken, 'loggedInAt' | 'lastUsedAt' | 'expiredAt'>>;
    readonly orderBy: OrderBy<Pick<AccessToken, 'loggedInAt' | 'lastUsedAt' | 'expiredAt'>>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & AccessTokenServiceDependencies,
): Promise<readonly AccessToken[] | readonly []> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  // TODO: デフォルトの制限
  return params.accessTokenRepository.getMany({
    filters: { ...params.filters, logInUserId: userAccount.id },
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

  const accessTokenExpirationDateExtended = AccessTokenReducers.toExpirationDateExtended(
    accessToken,
    { expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs') },
  );
  await params.accessTokenRepository.updateOne(accessTokenExpirationDateExtended);

  return {
    [accessTokenSecretSymbol]: accessTokenExpirationDateExtended[accessTokenSecretSymbol],
    expiredAt: accessTokenExpirationDateExtended.expiredAt,
  };
};

/**
 * 指定されたIDのアクセストークンを無効化する。
 * @throws アクセストークンが見つからない場合、アクセストークンが有効でない場合、アクセストークンが自分自身以外のユーザのものである場合は、{@linkcode Exception}（`accessToken.notExists`）を投げる。
 */
export const manuallyExpire = async (
  params: { readonly id: AccessTokenId } & AccessTokenServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const accessToken = await params.accessTokenRepository.getOneById(params.id);
  if (
    accessToken === undefined ||
    !AccessTokenReducers.isValid(accessToken) ||
    accessToken.logInUserId !== userAccount.id
  ) {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  const accessTokenRevoked = AccessTokenReducers.toRevoked(accessToken);
  await params.accessTokenRepository.updateOne(accessTokenRevoked);
};

/**
 * ログアウトする（クライアントが使用しているアクセストークンを無効化する）。
 */
export const logOut = async (params: AccessTokenServiceDependencies): Promise<void> => {
  const { accessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const accessTokenRevoked = AccessTokenReducers.toRevoked(accessToken);
  await params.accessTokenRepository.updateOne(accessTokenRevoked);
};
//#endregion
