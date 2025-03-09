import type { LanguageCode } from 'iso-639-1';
import type { OmitIndexSignature } from '../../utils/type-utils.ts';
import type { AccessTokenSecret } from '../entity/user/access-token.ts';

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

export interface SystemConfigurationMap extends ContextMap {
  readonly 'system.url': string;
  readonly 'system.displayName': I18nMap;
}

export interface RequestContextMap extends ContextMap {
  readonly 'request.acceptedLanguages': readonly LanguageCode[];
  readonly 'request.accessTokenSecret': AccessTokenSecret;
}

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
