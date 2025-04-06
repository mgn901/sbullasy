import type { NominalPrimitive } from '../utils/type-utils.ts';

//#region EmailAddress
const emailAddressTypeSymbol = Symbol('emailAddressTypeSymbol');

/**
 * Eメールアドレスを表す公称プリミティブ型。
 */
export type EmailAddress = NominalPrimitive<string, typeof emailAddressTypeSymbol>;

/**
 * 文字列がEメールアドレスになりうるかを判定して結果を`boolean`で返す。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がEメールアドレスになりうれば`true`を返し、`value`を{@linkcode EmailAddress}とみなす。そうでなければ`false`を返す。
 */
export const isEmailAddress = (value: unknown) => {
  // 正規表現は https://v2.ja.vuejs.org/v2/cookbook/form-validation より
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return typeof value === 'string' && regex.test(value);
};
//#endregion

//#region Name
const nameTypeSymbol = Symbol('nameTypeSymbol');

/**
 * 名前を表す公称プリミティブ型。
 * 2文字以上16文字以下の英数字およびハイフンから成る。
 */
export type Name = NominalPrimitive<string, typeof nameTypeSymbol>;

/**
 * 文字列が名前になりうるかを判定して結果を`boolean`で返す。
 *
 * 文字列が2文字以上16文字以下の英数字およびハイフンから成るかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`が名前になりうれば`true`を返し、`value`を{@linkcode Name}とみなす。そうでなければ`false`を返す。
 */
export const isName = (value: string): value is Name => {
  const regexp = /^[a-z0-9-]{2,16}$/;
  return regexp.test(value);
};
//#endregion

//#region DisplayName
const displayNameTypeSymbol = Symbol('displayNameTypeSymbol');

/**
 * 表示名を表す公称プリミティブ型。
 * 1文字以上64文字以下の制御文字以外の文字列から成る。ただし、先頭と末尾が空白以外の文字である必要がある。
 */
export type DisplayName = NominalPrimitive<string, typeof displayNameTypeSymbol>;

/**
 * 文字列が表示名になりうるかを判定する関数。
 *
 * 文字列が1文字以上64文字以下の制御文字以外の文字列から成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`が表示名になりうれば`true`を返し、`value`を{@linkcode DisplayName}とみなす。そうでなければ`false`を返す。
 */
export const isDisplayName = (value: string): value is DisplayName => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除く。
  const regexp = /^[^\x00-\x1F\x7F]{1,64}$/;
  return value.trim() === value && regexp.test(value);
};

//#endregion

//#region Title
const titleTypeSymbol = Symbol('titleTypeSymbol');

/**
 * タイトルを表す公称プリミティブ型。
 * 制御文字以外の文字列から成る。ただし、先頭と末尾が空白以外の文字列である必要がある。
 */
export type Title = NominalPrimitive<string, typeof titleTypeSymbol>;

/**
 * 文字列がタイトルになりうるかを判定する関数。
 *
 * 文字列が制御文字以外の文字列から成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がタイトルになりうれば`true`を返し、`value`を{@linkcode Title}とみなす。そうでなければ`false`を返す。
 */
export const isTitle = (value: string): value is Title => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除く。
  const regexp = /^[^\x00-\x1F\x7F]+$/;
  return value.trim() === value && regexp.test(value);
};
//#endregion

//#region TitleForUrl
const titleForUrlTypeSymbol = Symbol('titleForUrlTypeSymbol');

/**
 * タイトルのURL用表現を表す公称プリミティブ型。
 * 制御文字以外の文字列、英字は小文字のみから成る。ただし、先頭と末尾が空白以外の文字列である必要がある。
 */
export type TitleForUrl = NominalPrimitive<string, typeof titleForUrlTypeSymbol>;

/**
 * 文字列がタイトルのURL用表現になりうるかを判定する関数。
 *
 * 文字列が制御文字以外の文字列、英字は小文字のみから成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がタイトルのURL用表現になりうれば`true`を返し、`value`を{@linkcode TitleForUrl}とみなす。そうでなければ`false`を返す。
 */
export const isTitleForUrl = (value: string): value is TitleForUrl => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除く。
  const regexp = /^[^\x00-\x1F\x7FA-Z]+$/;
  return value.trim() === value && regexp.test(value);
};
//#endregion
