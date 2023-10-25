import { IItem } from '../../models/entities/item/IItem.ts';
import { IItemSummary } from '../../models/entities/item/IItemSummary.ts';
import { IRepositoryGetManyOptions } from './IRepositoryGetManyOptions.ts';

/**
 * {@linkcode IItem}のリポジトリ。
 */
export interface IItemRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param itemId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(itemId: IItem['id']): Promise<IItem>;

  /**
   * 指定したタイトルのURL用表現を持つオブジェクトを1件取得する。
   * @param itemTitleForUrl 取得するオブジェクトの表示名。
   */
  getOneByTitleForUrlOrThrow(itemTitleForUrl: IItem['titleForUrl']): Promise<IItem>;

  /**
   * 指定したIDを持つアイテムの要約を1件取得する。
   * @param itemId 取得するオブジェクトのID。
   */
  getOneSummaryByIdOrThrow(itemId: IItem['id']): Promise<IItemSummary>;

  /**
   * 指定した条件でオブジェクトを複数件取得する。
   * @param options 取得時の挙動の設定。
   */
  getSummaries(
    options: IRepositoryGetManyOptions<'id_asc' | 'displayName_asc', IItemSummary['id']>,
  ): Promise<IItemSummary[]>;

  /**
   * オブジェクトを永続化する。
   * @param item 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(item: IItem, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param itemId 削除するオブジェクトのID。
   */
  deleteOneById(itemId: IItem['id']): Promise<void>;
}
