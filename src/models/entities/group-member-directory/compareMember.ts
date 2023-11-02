import { compare } from '../../../utils/compare.ts';
import { IMember } from './IMember.ts';

/**
 * グループとグループの所属ユーザーの関係を表すエンティティオブジェクトを比較する比較関数。
 * @param a 1つ目のエンティティオブジェクト。
 * @param b 2つ目のエンティティオブジェクト。
 * @returns 比較結果。`a`が`b`の前に来るならば`-1`以下の値を返し、`b`が`a`の前に来るならば`1`以上の値を返す。
 */
export const compareMember = (a: IMember, b: IMember) => {
  const compareIdResult = compare(a.user.id, b.user.id);
  if (compareIdResult === 0) {
    return compare(a.type, b.type);
  }
  return compareIdResult;
};
