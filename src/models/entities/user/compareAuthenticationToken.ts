import { compare } from '../../../utils/compare.ts';
import { IAuthenticationToken } from './IAuthenticationToken.ts';

/**
 * 認証用トークンを表すエンティティオブジェクトの比較に用いる比較関数。IDを用いて比較する。
 * @param a 1つ目のエンティティオブジェクト。
 * @param b 2つ目のエンティティオブジェクト。
 * @returns 比較結果。`a`が`b`の前に来るならば`-1`以下の値を返し、`b`が`a`の前に来るならば`1`以上の値を返す。
 */
export const compareAuthenticationToken = (
  a: IAuthenticationToken,
  b: IAuthenticationToken,
): number => compare(a.id, b.id);
