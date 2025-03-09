import type { LanguageCode } from 'iso-639-1';
import { intersect } from '../../utils/set-operations/intersect.ts';
import type { I18nMap } from './context.ts';

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
