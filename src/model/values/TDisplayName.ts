import type { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';

const displayNameTypeSymbol = Symbol('displayNameTypeSymbol');

/**
 * 表示名を表す公称プリミティブ型。
 * 1文字以上64文字以下の制御文字以外の文字列から成る。ただし、先頭と末尾が空白以外の文字である必要がある。
 */
export type TDisplayName = TNominalPrimitive<string, typeof displayNameTypeSymbol>;

/**
 * 文字列が表示名になりうるかを判定する関数。
 *
 * 文字列が1文字以上64文字以下の制御文字以外の文字列から成り、先頭と末尾が空白以外の文字であるかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`が表示名になりうれば`true`を返し、`value`を`TDisplayName`とみなす。そうでなければ`false`を返す。
 */
export const isDisplayName = (value: string): value is TDisplayName => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除く。s
  const regexp = /^[^\x00-\x1F\x7F]{1,64}$/;
  return value.trim() === value && regexp.test(value);
};
