import { IUserShelf } from '../../../models/entities/user-shelf/IUserShelf.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 自分のブックマークに関する情報を持つエンティティオブジェクトを取得する。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 自分のブックマークに関する情報を持つエンティティオブジェクト。
 */
export const getUserShelf = async (
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IUserShelf> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);
  const userShelf = await implementations.userShelfRepository.getOneByIdOrThrow(user.id);

  return userShelf;
};
