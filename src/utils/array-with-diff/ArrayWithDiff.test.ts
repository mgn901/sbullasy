import { describe, expect, test } from '@jest/globals';
import { ArrayWithDiff } from './ArrayWithDiff.ts';
import { defaultCompareFn } from '../set-operations/defaultCompareFn.ts';

describe('ArrayWithDiff', () => {
  test('replace()の挙動', () => {
    const arrayWithDiff = new ArrayWithDiff(1, 2, 3);
    arrayWithDiff.replace(2, 3, 4);
    expect(arrayWithDiff[0]).toEqual(2);
    expect(arrayWithDiff[1]).toEqual(3);
    expect(arrayWithDiff[2]).toEqual(4);
    expect(arrayWithDiff.length).toEqual(3);
  });

  test('中身がプリミティブ値である場合のdiff()の挙動', () => {
    const arrayWithDiff = new ArrayWithDiff(1, 2, 3);
    arrayWithDiff.replace(2, 3, 4);
    const diff = arrayWithDiff.diff(defaultCompareFn);
    expect(diff.added).toEqual([4]);
    expect(diff.deleted).toEqual([1]);
  });

  test('中身がオブジェクトである場合のdiff()の挙動', () => {
    const arrayWithDiff = new ArrayWithDiff(
      { id: 0, value: 0 },
      { id: 1, value: 10 },
      { id: 2, value: 20 },
    );
    arrayWithDiff.replace({ id: 0, value: 0 }, { id: 1, value: 15 }, { id: 2, value: 20 });
    const diff = arrayWithDiff.diff((a, b) => {
      const compareIdResult = defaultCompareFn(a.id, b.id);
      if (compareIdResult === 0) {
        return defaultCompareFn(a.value, b.value);
      }
      return compareIdResult;
    });
    expect(diff.added).toEqual([{ id: 1, value: 15 }]);
    expect(diff.deleted).toEqual([{ id: 1, value: 10 }]);
  });
});
