import type { LanguageCode } from 'iso-639-1';
import type { OmitIndexSignature } from '../../utils/type-utils.ts';
import type { AccessTokenSecret } from '../entity/user/access-token.ts';

/** アプリケーションの設定や状態を表す辞書。 */
export interface ContextMap {
  readonly [K: string]:
    | string
    | number
    | boolean
    | I18nMap
    | undefined
    | readonly string[]
    | readonly number[]
    | readonly boolean[];
}

export type I18nMap = { readonly [K in LanguageCode]?: string };

/** システムの設定を表す辞書。 */
export interface SystemConfigurationMap extends ContextMap {
  readonly 'system.url': string;
  readonly 'system.displayName': I18nMap;
}

/** システム外部からサービスにリクエストするクライアントの状態を表す辞書。 */
export interface ClientContextMap extends ContextMap {
  readonly 'client.acceptedLanguages': readonly LanguageCode[];
}

/** ログインしているユーザのクライアントの状態を表す辞書。 */
export interface LogInUserClientContextMap extends ContextMap {
  readonly 'client.accessTokenSecret': AccessTokenSecret;
}

/** アプリケーションの設定や状態を永続化するリポジトリ。 */
export interface ContextRepository<TMap extends ContextMap> {
  get<K extends keyof OmitIndexSignature<TMap>>(
    this: ContextRepository<TMap>,
    key: K,
  ): OmitIndexSignature<TMap>[K];

  set<K extends keyof OmitIndexSignature<TMap>>(
    this: ContextRepository<TMap>,
    key: K,
    value: OmitIndexSignature<TMap>[K],
  ): void;
}
