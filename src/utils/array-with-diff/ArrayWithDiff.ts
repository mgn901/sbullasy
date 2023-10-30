import { except } from '../set-operations/except.ts';

/**
 * 初期化当時の配列と現在の配列との比較結果。
 */
interface ArrayDiff<T> {
  /**
   * 初期化当時と比較して追加された要素。
   */
  added: T[];

  /**
   * 初期化当時と比較して削除された要素。
   */
  deleted: T[];
}

/**
 * 組み込みの配列を継承したクラスで、初期化当時の配列と破壊的変更を加えた後の配列との差分を取得できる。
 */
export class ArrayWithDiff<T> extends Array<T> {
  private initial: T[];

  public constructor(...items: T[]) {
    super(...items);
    this.initial = [...items];
  }

  /**
   * 初期化当時の配列と現在の配列とを比較する。
   * @param compareFn 比較関数。第1引数と第2引数を比較し、第1引数の方が前に来るならば-1以下の値を返し、第2引数の方が前に来るならば1以上の値を返し、等しければ0を返すような関数。
   * @returns 初期化当時の配列と現在の配列との比較結果。
   */
  public diff(compareFn: (a: T, b: T) => number): ArrayDiff<T> {
    const added = except(this, this.initial, compareFn);
    const deleted = except(this.initial, this, compareFn);
    return { added, deleted };
  }

  /**
   * 配列のすべての要素を別の要素で置き換える。
   * @param items 置き換え後の要素。
   */
  public toReplaced(...items: T[]): ArrayWithDiff<T> {
    const newArrayWithDiff = new ArrayWithDiff(...this.initial);
    newArrayWithDiff.splice(0, this.length, ...items);
    return newArrayWithDiff;
  }
}
