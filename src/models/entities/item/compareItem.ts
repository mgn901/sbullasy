import { IItem } from './IItem.ts';
import { IItemSummary } from './IItemSummary.ts';
import { compare } from '../../../utils/compare.ts';

/**
 * アイテムのエンティティオブジェクトの比較に用いる比較関数。IDおよび更新日時を用いて比較する。
 * @param a 1つ目のアイテムのエンティティオブジェクト。
 * @param b 2つ目のアイテムのエンティティオブジェクト。
 * @returns 比較結果。`a`が`b`の前に来るならば`-1`以下の値を返し、`b`が`a`の前に来るならば`1`以上の値を返す。
 */
export const compareItem = (a: IItem | IItemSummary, b: IItem | IItemSummary): number => {
  const compareIdResult = compare(a.id, b.id);
  if (compareIdResult !== 0) {
    return compareIdResult;
  }
  const compareUpdatedAtResult = compare(a.updatedAt.getTime(), b.updatedAt.getTime());
  if (compareUpdatedAtResult !== 0) {
    return compareUpdatedAtResult;
  }
  return 0;
};
