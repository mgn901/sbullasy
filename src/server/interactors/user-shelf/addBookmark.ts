import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ブックマークにアイテムを追加する。
 * @param itemId ブックマークに追加するアイテムのID。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const addBookmark = async (
  itemId: IItem['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userShelf = await implementations.userShelfRepository.getOneByIdOrThrow(user.id);
  const itemSummary = await implementations.itemRepository.getOneSummaryByIdOrThrow(itemId);

  const context = createSelfContextOrThrow(user);

  const newUserShelf = userShelf.setBookmarks([...userShelf.bookmarks, itemSummary], context);

  await implementations.userShelfRepository.saveOne(newUserShelf, true);
};
