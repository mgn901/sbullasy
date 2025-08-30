import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { Filters, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type {
  ContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import { generateLongSecret, type LongSecret } from '../../lib/random-values/long-secret.ts';
import type { GetOneBy, MutableRepository, Repository } from '../../lib/repository.ts';
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
export const sessionAccessTokenIdSymbol = Symbol('accessToken.id');
export const accessTokenSecretSymbol = Symbol('accessToken.secret');
export type AccessTokenId = NominalPrimitive<Id, typeof sessionAccessTokenIdSymbol>;
export type AccessTokenSecret = NominalPrimitive<LongSecret, typeof sessionAccessTokenIdSymbol>;

/**
 * アクセストークンを表す。
 * - ユーザが認証試行を完了させると、アクセストークン（{@linkcode SessionAccessToken}）が作成される。
 * - ユーザは、有効なアクセストークンのシークレットを送信することで、自分が認証を完了させたユーザであることを知らせることができる。
 * - サービスは、アクセストークンのシークレットを受け取り、{@linkcode AccessTokenRepository.getOneBySecret}を用いてアクセストークンを取得し、その有効性を確認することで、どのユーザがログインしているのかを知ることができる。
 * - アクセストークンは有効期限（{@linkcode SessionAccessToken.expiredAt}）を持ち、有効期限を過ぎた場合は無効になる。
 */
export type AccessToken = SessionAccessToken;

/**
 * 認証によって作成されたアクセストークンを表す。
 */
export type SessionAccessToken = ReturnType<typeof newSessionAccessTokenFrom>;

export const newSessionAccessTokenFrom = <
  P extends {
    logInUserId: UserId;
    logInIpAddress: string;
    logInUserAgent: string;
    expiredAfterMs: number;
  },
>(
  params: Readonly<P>,
) => {
  const loggedInAt = new Date();

  return {
    type: 'sessionAccessToken',
    id: generateId() as AccessTokenId,
    [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
    logInUserId: params.logInUserId,
    logInIpAddress: params.logInIpAddress,
    logInUserAgent: params.logInUserAgent,
    expiredAt: new Date(loggedInAt.getTime() + params.expiredAfterMs),
    lastUsedAt: loggedInAt,
    loggedInAt,
  } as const;
};

export type AccessTokenRepository = MutableRepository<AccessToken, AccessTokenId, 'id'> & {
  readonly getOneBySecret: GetOneBy<AccessToken, AccessTokenSecret, typeof accessTokenSecretSymbol>;
};
//#endregion

//#region SessionAccessTokenRenewedEvent
export const sessionAccessTokenRenewedEventIdSymbol = Symbol('sessionAccessToken.renewed.id');
export type SessionAccessTokenRenewedEventId = NominalPrimitive<
  Id,
  typeof sessionAccessTokenRenewedEventIdSymbol
>;

export type SessionAccessTokenRenewedEvent = ReturnType<
  typeof newSessionAccessTokenRenewedEventFrom
>;

export const newSessionAccessTokenRenewedEventFrom = <P extends { accessTokenId: AccessTokenId }>(
  params: Readonly<P>,
) =>
  ({
    type: 'sessionAccessToken.renewed',
    id: generateId() as SessionAccessTokenRenewedEventId,
    accessTokenId: params.accessTokenId,
    renewedAt: new Date(),
  }) as const;

export type AccessTokenRenewedEventRepository = Repository<
  SessionAccessTokenRenewedEvent,
  AccessTokenId,
  'accessTokenId'
>;
//#endregion

//#region RevokedSessionAccessToken
export type RevokedSessionAccessToken = ReturnType<typeof newRevokedSessionAccessTokenFrom>;

export const newRevokedSessionAccessTokenFrom = <P extends { accessToken: AccessToken }>(
  params: Readonly<P>,
) =>
  ({
    type: 'revokedSessionAccessToken',
    id: params.accessToken.id,
    logInUserId: params.accessToken.logInUserId,
    logInIpAddress: params.accessToken.logInIpAddress,
    logInUserAgent: params.accessToken.logInUserAgent,
    expiredAt: params.accessToken.expiredAt,
    loggedInAt: params.accessToken.loggedInAt,
    revokedAt: new Date(),
  }) as const;

export type RevokedSessionAccessTokenRepository = Repository<
  RevokedSessionAccessToken,
  AccessTokenId,
  'id'
>;
//#endregion

export type AccessTokenServiceDependencies = {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly accessTokenRenewedEventRepository: AccessTokenRenewedEventRepository;
  readonly revokedSessionAccessTokenRepository: RevokedSessionAccessTokenRepository;
  readonly contextRepository: ContextRepository<AccessTokenConfigurationMap>;
  readonly clientContextRepository: ContextRepository<LogInUserClientContextMap>;
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
};

/**
 * 自分自身のユーザアカウントに関連するアクセストークンを取得する。
 * - 有効なアクセストークンが必要である。
 */
export const getManyMyAccessTokens = async (
  params: {
    readonly filters?: Filters<Pick<AccessToken, 'loggedInAt'>>;
    readonly orderBy: OrderBy<Pick<AccessToken, 'loggedInAt'>>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & AccessTokenServiceDependencies,
): Promise<{ readonly accessTokens: readonly AccessToken[] }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  // TODO: デフォルトの制限
  const accessTokens = await params.accessTokenRepository.getMany({
    filters: { ...params.filters, logInUserId: myUserAccount.id },
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit,
  });

  return { accessTokens };
};

/**
 * クライアントが使用しているアクセストークンの有効期限を延長し、新しいシークレットと有効期限を返す。
 * - 有効なアクセストークンが必要である。
 * @throws アクセストークンが認証によって作成された{@linkcode SessionAccessToken}でない場合は、{@linkcode Exception}（`accessToken.notExists`）を投げる。
 */
export const renewSessionAccessToken = async (
  params: AccessTokenServiceDependencies,
): Promise<{
  readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  readonly expiredAt: Date;
}> => {
  const { myAccessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  if (myAccessToken.type !== 'sessionAccessToken') {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  const newAccessToken = {
    ...myAccessToken,
    [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
    expiredAt: new Date(Date.now() + params.contextRepository.get('accessToken.expiredAfterMs')),
  };

  await params.accessTokenRepository.updateOne(newAccessToken);
  await params.accessTokenRenewedEventRepository.createOne(
    newSessionAccessTokenRenewedEventFrom({ accessTokenId: myAccessToken.id }),
  );

  return {
    [accessTokenSecretSymbol]: newAccessToken[accessTokenSecretSymbol],
    expiredAt: newAccessToken.expiredAt,
  };
};

/**
 * 指定されたIDの自分のアクセストークンを無効化する。
 * - 有効なアクセストークンが必要である。
 * @throws アクセストークンが見つからない場合、アクセストークンが有効でない場合、アクセストークンが自分自身以外のユーザのものである場合は、{@linkcode Exception}（`accessToken.notExists`）を投げる。
 */
export const revokeMyAccessToken = async (
  params: { readonly id: AccessTokenId } & AccessTokenServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const accessToken = await params.accessTokenRepository.getOneById(params.id);
  if (
    accessToken === undefined ||
    accessToken.expiredAt < new Date() ||
    accessToken.logInUserId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  await params.revokedSessionAccessTokenRepository.createOne(
    newRevokedSessionAccessTokenFrom({ accessToken }),
  );
  await params.accessTokenRepository.deleteOneById(params.id);
};

/**
 * ログアウト（クライアントが使用しているアクセストークンを無効化）する。
 * - 有効なアクセストークンが必要である。
 * @throws アクセストークンが認証によって作成された{@linkcode SessionAccessToken}でない場合は、{@linkcode Exception}（`accessToken.notExists`）を投げる。
 */
export const logOut = async (params: AccessTokenServiceDependencies) => {
  const { myAccessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  if (myAccessToken.type !== 'sessionAccessToken') {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  await params.revokedSessionAccessTokenRepository.createOne(
    newRevokedSessionAccessTokenFrom({ accessToken: myAccessToken }),
  );
  await params.accessTokenRepository.deleteOneById(myAccessToken.id);
};
