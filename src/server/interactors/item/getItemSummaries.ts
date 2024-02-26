import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { IItemSummary } from '../../../models/entities/item/IItemSummary.ts';
import { InvalidRequestException } from '../../../models/errors/InvalidRequestException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定した条件でアイテムの要約のエンティティオブジェクトを複数件取得する。
 * @param options 取得方法の設定。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns アイテムの要約のエンティティオブジェクトの配列。
 */
export const getItemSummaries = async (
  options: IRepositoryGetManyOptions<'id_asc' | 'titleForUrl_asc', IItemSummary['id']> & {
    typeIdOrName: string;
  },
  implementations: IImplementations,
): Promise<IItemSummary[]> => {
  const { typeIdOrName } = options;
  if (isId<IItemType>(typeIdOrName)) {
    return implementations.itemRepository.getSummaries({ ...options, itemTypeId: typeIdOrName });
  }
  if (isName(typeIdOrName)) {
    const itemType =
      await implementations.itemTypeRepository.getOneByNamePluralOrThrow(typeIdOrName);
    return implementations.itemRepository.getSummaries({ ...options, itemTypeId: itemType.id });
  }
  throw new InvalidRequestException();
};
