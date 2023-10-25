import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムの種類のエンティティオブジェクトを取得する。
 * @param itemTypeId 取得するアイテムの種類のID。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したアイテムの種類のエンティティオブジェクト。
 */
export const getItemType = async (
  itemTypeId: IItemType['id'],
  implementations: IImplementations,
): Promise<IItemType> => implementations.itemTypeRepository.getOneByIdOrThrow(itemTypeId);
