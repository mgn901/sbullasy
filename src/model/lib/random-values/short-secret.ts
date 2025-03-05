import type { NominalPrimitive } from '../../../utils/type-utils.ts';

/**
 * 短い8文字のシークレット文字列を表す公称プリミティブ型。
 * 8文字の数字および`a`から`f`までの英字から成る。
 */
const symbol = Symbol();
export type ShortSecret = NominalPrimitive<string, typeof symbol>;

/**
 * 文字列が短いシークレットになりうるかを判定する関数。
 *
 * 文字列が8文字の数字および`a`から`f`までの英字から成るかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がシークレット文字列になりうれば`true`を返し、`value`を`TShortSecret`とみなす。そうでなければ`false`を返す。
 */
export const isShortSecret = (value: string): value is ShortSecret => {
  const regexp = /^[a-f0-9]{8}$/;
  return regexp.test(value);
};

/**
 * 32ビットのシークレットを生成し、8文字の文字列として返す。
 * @returns 生成されたシークレット文字列。
 */
export const generateShortSecret = (): ShortSecret => {
  const array = new Uint8Array(4);
  globalThis.crypto.getRandomValues(array);
  const string = [...array]
    .map((n) => n.toString(16))
    .join('')
    .padStart(8, '0');
  if (!isShortSecret(string)) {
    throw new ShortSecretGenerationFailedError('シークレットを生成できません。');
  }
  return string;
};

export class ShortSecretGenerationFailedError extends Error {
  public readonly name = 'ShortSecretGenerationFailedError';
}
