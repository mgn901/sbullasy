import type { LanguageCode } from 'iso-639-1';
import { intersect } from '../../utils/set-operations/intersect.ts';
import type { I18nMap } from './context.ts';

export type { LanguageCode };

export const selectLanguage = (params: {
  readonly accepted: readonly LanguageCode[];
  readonly available: readonly LanguageCode[];
  readonly default?: LanguageCode | undefined;
}): LanguageCode => {
  const selected = intersect(params.accepted, params.available).sort(
    (a, b) => params.available.indexOf(a) - params.available.indexOf(b),
  )[0];
  return selected ?? params.default ?? 'en';
};

/**
 * `i18nMap`から、`acceptedLanguages`または`defaultLanguage`に含まれる言語で優先順位が上位である言語の項目を選択する。
 *
 * @param params `acceptedLanguages`では、希望する言語を優先順位が高い順に配列で指定する。
 */
export const localize = (params: {
  readonly i18nMap: I18nMap;
  readonly acceptedLanguages: readonly LanguageCode[];
  readonly defaultLanguage?: keyof I18nMap & LanguageCode;
}): NonNullable<I18nMap[keyof I18nMap]> => {
  const selected = selectLanguage({
    accepted: params.acceptedLanguages,
    available: Object.keys(params.i18nMap) as readonly LanguageCode[],
    default: params.defaultLanguage,
  });
  // biome-ignore lint/style/noNonNullAssertion: `selected`は`params.i18nMap`のキーになる。
  return params.i18nMap[selected]!;
};
