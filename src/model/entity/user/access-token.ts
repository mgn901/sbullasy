import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type {
  ContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import { generateLongSecret, type LongSecret } from '../../lib/random-values/long-secret.ts';
import type { GetOneBy, Repository } from '../../lib/repository.ts';
import type { Session, SessionId } from './session.ts';
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
 *
 * - ユーザが認証試行を完了させると、セッション（{@linkcode Session}）と、そのセッションに関連付けられたアクセストークン（{@linkcode SessionAccessToken}）が作成される。
 * - ユーザは、有効なセッションに関連付けられた有効なアクセストークンのシークレットを送信することで、自分が認証を完了させたユーザであることを知らせることができる。
 * - サービスは、アクセストークンのシークレットを受け取り、{@linkcode AccessTokenRepository.getOneBySecret}を用いてアクセストークンを取得し、その有効性を確認することで、どのユーザがログインしているのかを知ることができる。
 * - アクセストークンは有効期限（{@linkcode SessionAccessToken.expiredAt}）を持ち、有効期限を過ぎた場合は無効になる。
 * - アクセストークンに関連付けられたセッションが{@linkcode SessionRevokedEvent}で無効化された場合、そのアクセストークンは無効になる。
 * - 同じセッションに関連付けられたアクセストークンを再度新しく作成することもできる。新しいアクセストークンが作成された場合、{@linkcode SessionAccessTokenRenewedEvent}によって古いアクセストークンは無効になる。
 */
export type AccessToken = SessionAccessToken;

/**
 * セッション（{@linkcode Session}）に関連するアクセストークンを表す。
 */
export type SessionAccessToken = ReturnType<typeof newSessionAccessTokenFrom>;

export const newSessionAccessTokenFrom = <
  P extends { logInUserId: UserId; sessionId: SessionId; expiredAfterMs: number },
>(
  params: Readonly<P>,
) => {
  const createdAt = new Date();
  const expiredAt = new Date(createdAt.getTime() + params.expiredAfterMs);

  return {
    type: 'sessionAccessToken',
    id: generateId() as AccessTokenId,
    [accessTokenSecretSymbol]: generateLongSecret() as AccessTokenSecret,
    logInUserId: params.logInUserId,
    sessionId: params.sessionId,
    createdAt,
    expiredAt,
  } as const;
};

export type AccessTokenRepository = Repository<AccessToken, AccessTokenId, 'id'> & {
  readonly getOneBySecret: GetOneBy<AccessToken, AccessTokenSecret, typeof accessTokenSecretSymbol>;
};
//#endregion

//#region AccessTokenRevokedEvent
export type SessionAccessTokenRenewedEvent = ReturnType<
  typeof newSessionAccessTokenRenewedEventFrom
>;

export const newSessionAccessTokenRenewedEventFrom = <P extends { accessTokenId: AccessTokenId }>(
  params: Readonly<P>,
) =>
  ({
    type: 'sessionAccessToken.renewed',
    accessTokenId: params.accessTokenId,
  }) as const;

export type AccessTokenRenewedEventRepository = Repository<
  SessionAccessTokenRenewedEvent,
  AccessTokenId,
  'accessTokenId'
>;
//#endregion

export type AccessTokenServiceDependencies = {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly accessTokenRenewedEventRepository: AccessTokenRenewedEventRepository;
  readonly contextRepository: ContextRepository<AccessTokenConfigurationMap>;
  readonly clientContextRepository: ContextRepository<LogInUserClientContextMap>;
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
};

/**
 * クライアントが使用しているセッションのアクセストークンを再度新しく作成し、新しいシークレットと有効期限を返す。
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

  const newAccessToken = newSessionAccessTokenFrom({
    logInUserId: myAccessToken.logInUserId,
    sessionId: myAccessToken.sessionId,
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });

  if (myAccessToken.type !== 'sessionAccessToken') {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  await params.accessTokenRepository.createOne(newAccessToken);
  await params.accessTokenRenewedEventRepository.createOne(
    newSessionAccessTokenRenewedEventFrom({ accessTokenId: myAccessToken.id }),
  );

  return {
    [accessTokenSecretSymbol]: newAccessToken[accessTokenSecretSymbol],
    expiredAt: newAccessToken.expiredAt,
  };
};
