import { IItemSummary } from '../../../models/entities/item/IItemSummary.ts';
import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定した条件でアイテムの要約のエンティティオブジェクトを複数件取得する。
 * @param options 取得方法の設定。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns アイテムの要約のエンティティオブジェクトの配列。
 */
export const getItemSummaries = async (
  options: IRepositoryGetManyOptions<'id_asc' | 'displayName_asc', IItemSummary['id']>,
  implementations: IImplementations,
): Promise<IItemSummary[]> => implementations.itemRepository.getSummaries(options);
