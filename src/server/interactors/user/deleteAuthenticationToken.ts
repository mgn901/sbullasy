import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { IAuthenticationToken } from '../../../models/entities/user/IAuthenticationToken.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 認証用トークンを削除する。
 * @param tokenId 削除するトークンのID。
 * @param tokenSecret 操作しようとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 */
export const deleteAuthenticationToken = async (
  tokenId: IAuthenticationToken['id'],
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<void> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);

  const context = createSelfContextOrThrow(user);

  user.deleteToken(tokenId, context);

  await implementations.userRepository.saveOne(user, true);
};
