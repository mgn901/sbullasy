import type { TNominalPrimitive } from '../../utils/primitive.ts';

const nameTypeSymbol = Symbol('nameTypeSymbol');

/**
 * 名前を表す公称プリミティブ型。
 * 2文字以上16文字以下の英数字およびハイフンから成る。
 */
export type TName = TNominalPrimitive<string, typeof nameTypeSymbol>;

/**
 * 文字列が名前になりうるかを判定する関数。
 *
 * 文字列が2文字以上16文字以下の英数字およびハイフンから成るかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`が名前になりうれば`true`を返し、`value`を`TName`とみなす。そうでなければ`false`を返す。
 */
export const isName = (value: string): value is TName => {
  const regexp = /^[a-zA-Z0-9-]{2,16}$/;
  return regexp.test(value);
};
