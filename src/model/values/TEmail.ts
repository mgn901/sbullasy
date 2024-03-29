import type { TNominalPrimitive } from '../../utils/primitive.ts';

const emailTypeSymbol = Symbol('emailTypeSymbol');

/**
 * Eメールアドレスを表す公称プリミティブ型。
 */
export type TEmail = TNominalPrimitive<string, typeof emailTypeSymbol>;

/**
 * 文字列がEメールアドレスであるかを判定する関数。
 *
 * 文字列がHTML仕様の「valid e-mail address」に準拠するかを判定する。
 * 「valid email-address」はRFC 5322におけるEメールアドレスの定義とは異なることに注意する。
 *
 * 参照: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 *
 * @param value 判定対象の文字列。
 * @returns `value`がEメールアドレスであれば`true`を返し、`value`を`TEmail`とみなす。そうでなければ`false`を返す。
 */
export const isEmail = (value: string): value is TEmail => {
  const regexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regexp.test(value);
};
