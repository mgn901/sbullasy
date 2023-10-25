import { IItem } from '../../../models/entities/item/IItem.ts';
import { InvalidRequestException } from '../../../models/errors/InvalidRequestException.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムのエンティティオブジェクトを取得する。
 * @param itemIdOrDisplayName 取得するアイテムのIDまたは名前。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したアイテムのエンティティオブジェクト。
 */
export const getItem = async (
  itemIdOrDisplayName: IItem['id'] | `@${IItem['displayName']}`,
  implementations: IImplementations,
): Promise<IItem> => {
  if (itemIdOrDisplayName.startsWith('@')) {
    const itemDisplayName = itemIdOrDisplayName.slice(1);
    if (!isDisplayName(itemDisplayName)) {
      throw new InvalidRequestException();
    }
    return implementations.itemRepository.getOneByDisplayNameOrThrow(itemDisplayName);
  }

  if (!isId(itemIdOrDisplayName)) {
    throw new InvalidRequestException();
  }
  return implementations.itemRepository.getOneByIdOrThrow(itemIdOrDisplayName);
};
