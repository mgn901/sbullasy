import type { TNominalPrimitive } from '../../utils/primitive.ts';

const titleTypeSymbol = Symbol('titleTypeSymbol');

/**
 * タイトルを表す公称プリミティブ型。
 * 制御文字以外の文字列から成る。ただし、先頭と末尾が空白以外の文字列である必要がある。
 */
export type TTitle = TNominalPrimitive<string, typeof titleTypeSymbol>;

/**
 * 文字列がタイトルになりうるかを判定する関数。
 *
 * 文字列が制御文字以外の文字列から成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がタイトルになりうれば`true`を返し、`value`を`TTitle`とみなす。そうでなければ`false`を返す。
 */
export const isTitle = (value: string): value is TTitle => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除く。
  const regexp = /^[^\x00-\x1F\x7F]+$/;
  return value.trim() === value && regexp.test(value);
};
