import { IItem } from '../../../models/entities/item/IItem.ts';
import { InvalidRequestException } from '../../../models/errors/InvalidRequestException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isTitleForUrl } from '../../../models/values/TTitleForUrl.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * アイテムのエンティティオブジェクトを取得する。
 * @param itemIdOrTitleForUrl 取得するアイテムのIDまたはタイトルのURL用表現。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したアイテムのエンティティオブジェクト。
 */
export const getItem = async (
  itemIdOrTitleForUrl: IItem['id'] | `@${IItem['title']}`,
  implementations: IImplementations,
): Promise<IItem> => {
  if (itemIdOrTitleForUrl.startsWith('@')) {
    const itemTitleForUrl = itemIdOrTitleForUrl.slice(1);
    if (!isTitleForUrl(itemTitleForUrl)) {
      throw new InvalidRequestException();
    }
    return implementations.itemRepository.getOneByTitleForUrlOrThrow(itemTitleForUrl);
  }

  if (!isId(itemIdOrTitleForUrl)) {
    throw new InvalidRequestException();
  }
  return implementations.itemRepository.getOneByIdOrThrow(itemIdOrTitleForUrl);
};
