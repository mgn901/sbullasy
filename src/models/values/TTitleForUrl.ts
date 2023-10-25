import { TNominalPrimitive } from '../../utils/TNominalPrimitive.ts';

/**
 * タイトルのURL用表現を表す公称プリミティブ型。
 * 制御文字以外の文字列、英字は小文字のみから成る。ただし、先頭と末尾が空白以外の文字列である必要がある。
 */
export type TTitleForUrl = TNominalPrimitive<string, 'TTitleForUrl'>;

/**
 * 文字列がタイトルのURL用表現になりうるかを判定する関数。
 *
 * 文字列が制御文字以外の文字列、英字は小文字のみから成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がタイトルのURL用表現になりうれば`true`を返し、`value`を`TTitleForUrl`とみなす。そうでなければ`false`を返す。
 */
export const isTitleForUrl = (value: string): value is TTitleForUrl => {
  // eslint-disable-next-line no-control-regex
  const regexp = /^[^\x00-\x1F\x7FA-Z]+$/;
  return value.trim() === value && regexp.test(value);
};
