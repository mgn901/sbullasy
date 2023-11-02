import { compare } from '../../../utils/compare.ts';
import { IItemType } from './IItemType.ts';
import { IItemTypeSummary } from './IItemTypeSummary.ts';

/**
 * アイテムの種類のエンティティオブジェクトの比較関数。
 * @param a 1つ目のエンティティオブジェクト。
 * @param b 2つ目のエンティティオブジェクト。
 * @returns 比較結果。`a`が`b`の前に来るならば`-1`以下の値を返し、`b`が`a`の前に来るならば`1`以上の値を返す。
 */
export const compareItemType = <T extends IItemType | IItemTypeSummary>(a: T, b: T): number => {
  const compareIdResult = compare(a.id, b.id);
  if (compareIdResult !== 0) {
    return compareIdResult;
  }
  const compareNameSingularResult = compare(a.nameSingular, b.nameSingular);
  if (compareNameSingularResult !== 0) {
    return compareNameSingularResult;
  }
  const compareNamePluralResult = compare(a.namePlural, b.namePlural);
  if (compareNamePluralResult !== 0) {
    return compareNamePluralResult;
  }
  const compareDisplayNameResult = compare(a.displayName, b.displayName);
  if (compareDisplayNameResult !== 0) {
    return compareDisplayNameResult;
  }
  if (a.__brand !== 'IItemType' || b.__brand !== 'IItemType') {
    return 0;
  }
  const optionsCompareResult = compare(JSON.stringify(a.options), JSON.stringify(b.options));
  if (optionsCompareResult !== 0) {
    return optionsCompareResult;
  }
  const schemaCompareResult = compare(JSON.stringify(a.schema), JSON.stringify(b.schema));
  if (schemaCompareResult !== 0) {
    return schemaCompareResult;
  }
  return 0;
};
