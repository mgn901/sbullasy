import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ブックマークからアイテムを削除する。
 * @param itemId ブックマークから削除するアイテムのID。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteBookmark = async (
  itemId: IItem['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userShelf = await implementations.userShelfRepository.getOneByIdOrThrow(user.id);

  const selfContext = createSelfContextOrThrow(user);

  userShelf.setBookmarks(
    userShelf.bookmarks.filter((bookmark) => bookmark.id !== itemId),
    selfContext,
  );

  await implementations.userShelfRepository.saveOne(userShelf, true);
};
