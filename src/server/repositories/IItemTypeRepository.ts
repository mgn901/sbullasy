import { IItemType } from '../../models/entities/item-type/IItemType.ts';
import { IItemTypeSummary } from '../../models/entities/item-type/IItemTypeSummary.ts';
import { IRepositoryGetManyOptions } from './IRepositoryGetManyOptions.ts';

/**
 * {@linkcode IItemType}のリポジトリ。
 */
export interface IItemTypeRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param itemTypeId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(itemTypeId: IItemType['id']): Promise<IItemType>;

  /**
   * 指定した名前（単数形）を持つオブジェクトを1件取得する。
   * @param itemTypeNameSingular 取得するオブジェクトの名前（単数形）。
   */
  getOneByNameSingularOrThrow(itemTypeNameSingular: IItemType['nameSingular']): Promise<IItemType>;

  /**
   * 指定した名前（複数形）を持つオブジェクトを1件取得する。
   * @param itemTypeNamePlural 取得するオブジェクトの名前（複数形）。
   */
  getOneByNamePluralOrThrow(itemTypeNamePlural: IItemType['namePlural']): Promise<IItemType>;

  /**
   * 指定した条件でオブジェクトを複数件取得する。
   * @param options 取得時の挙動の設定。
   */
  getSummaries(
    options: IRepositoryGetManyOptions<
      'id_asc' | 'nameSingular_asc' | 'namePlural_asc',
      IItemType['id']
    >,
  ): Promise<IItemTypeSummary[]>;

  /**
   * オブジェクトを永続化する。
   * @param itemType 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(itemType: IItemType, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param itemTypeId 削除するオブジェクトのID。
   */
  deleteOneById(itemTypeId: IItemType['id']): Promise<void>;
}
