/**
 * リポジトリの複数件取得系メソッドの挙動の設定。
 * @typeParam O - 取得結果の並べ替えに使用するカラムと昇順・降順の別を指定する際に利用可能なリテラル。
 * @typeParam C - 結果のどの項目以降の部分を取得するのかを指定する際に利用可能な型。
 */
export interface IRepositoryGetManyOptions<O extends string, C extends string> {
  /**
   * 取得結果の並べ替えに使用するカラムと昇順・降順の別。
   */
  order?: O | undefined;

  /**
   * 取得する件数。
   */
  limit?: number | undefined;

  /**
   * 結果の何番目から取得するのか。
   */
  offset?: number | undefined;

  /**
   * 結果のどの項目以降の部分を取得するのか。
   */
  cursor?: C | undefined;
}
