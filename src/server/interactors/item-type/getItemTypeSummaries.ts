import { IItemTypeSummary } from '../../../models/entities/item-type/IItemTypeSummary.ts';
import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定した条件でアイテムの種類の要約のエンティティオブジェクトを複数件取得する。
 * @param options 取得方法の設定。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns アイテムの種類の要約のエンティティオブジェクトの配列。
 */
export const getItemTypeSummaries = async (
  options: IRepositoryGetManyOptions<
    'id_asc' | 'nameSingular_asc' | 'namePlural_asc',
    IItemTypeSummary['id']
  >,
  implementations: IImplementations,
): Promise<IItemTypeSummary[]> => implementations.itemTypeRepository.getSummaries(options);
