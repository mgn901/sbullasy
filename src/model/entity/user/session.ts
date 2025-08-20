import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { Filters, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type { ContextRepository, LogInUserClientContextMap } from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import type { Repository } from '../../lib/repository.ts';
import type { UserId } from './values.ts';

//#region Session
export const sessionIdSymbol = Symbol('session.type');
export type SessionId = NominalPrimitive<Id, typeof sessionIdSymbol>;

/**
 * 1つのセッションを表す。
 *
 * - ユーザが認証試行を完了させると、セッションと、そのセッションに関連付けられたアクセストークン（{@linkcode SessionAccessToken}）が作成される。
 * - ユーザは有効なセッションに関連付けられた有効なアクセストークンのシークレットを送信することで、自分が認証を完了させたユーザであることをサービスに知らせることができる。
 * - セッションは{@linkcode SessionRevokedEvent}で無効化することができる。
 */
export type Session = ReturnType<typeof newSessionFrom>;

export const newSessionFrom = <
  P extends {
    logInUserId: UserId;
    logInIpAddress: string;
    logInUserAgent: string;
  },
>(
  params: Readonly<P>,
) =>
  ({
    id: generateId() as SessionId,
    logInUserId: params.logInUserId,
    logInIpAddress: params.logInIpAddress,
    logInUserAgent: params.logInUserAgent,
    loggedInAt: new Date(),
  }) as const;

export type SessionRepository = Repository<Session, SessionId, 'id'>;
//#endregion

//#region SessionRevokedEvent
export type SessionRevokedEvent = ReturnType<typeof newSessionRevokedEventFrom>;

export const newSessionRevokedEventFrom = <P extends { sessionId: SessionId }>(
  params: Readonly<P>,
) => ({
  type: 'session.revoked',
  sessionId: params.sessionId,
  revokedAt: new Date(),
});

export type SessionRevokedEventRepository = Repository<SessionRevokedEvent, SessionId, 'sessionId'>;
//#endregion

export type SessionServiceDependencies = {
  readonly sessionRepository: SessionRepository;
  readonly sessionRevokedEventRepository: SessionRevokedEventRepository;
  readonly clientContextRepository: ContextRepository<LogInUserClientContextMap>;
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
};

/**
 * 自分自身のユーザアカウントに関連するセッションを取得する。
 */
export const getManyMySessions = async (
  params: {
    readonly filters?: Filters<Pick<Session, 'loggedInAt'>>;
    readonly orderBy: OrderBy<Pick<Session, 'loggedInAt'>>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & SessionServiceDependencies,
): Promise<{ readonly sessions: readonly Session[] }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  // TODO: デフォルトの制限
  const sessions = await params.sessionRepository.getMany({
    filters: { ...params.filters, logInUserId: myUserAccount.id },
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit,
  });

  return { sessions };
};

/**
 * 指定されたIDの自分のセッションを無効化する。
 * @throws アクセストークンが見つからない場合、アクセストークンが有効でない場合、アクセストークンが自分自身以外のユーザのものである場合は、{@linkcode Exception}（`accessToken.notExists`）を投げる。
 */
export const revokeMySession = async (
  params: { readonly id: SessionId } & SessionServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const session = await params.sessionRepository.getOneById(params.id);
  const isRevoked = (await params.sessionRevokedEventRepository.getOneById(params.id)) ?? false;
  if (session === undefined || isRevoked || session.logInUserId !== myUserAccount.id) {
    throw Exception.create({ exceptionName: 'session.notExists' });
  }

  await params.sessionRevokedEventRepository.createOne(
    newSessionRevokedEventFrom({ sessionId: session.id }),
  );
};

/**
 * ログアウト（クライアントが使用しているセッションを無効化）する。
 */
export const logOut = async (params: SessionServiceDependencies) => {
  const { myAccessToken } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const isRevoked =
    (await params.sessionRevokedEventRepository.getOneById(myAccessToken.sessionId)) ?? false;
  if (isRevoked || myAccessToken.type !== 'sessionAccessToken') {
    throw Exception.create({ exceptionName: 'accessToken.notExists' });
  }

  await params.sessionRevokedEventRepository.createOne(
    newSessionRevokedEventFrom({ sessionId: myAccessToken.sessionId }),
  );
};
