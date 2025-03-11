import {
  type AccessToken,
  AccessTokenReducers,
  type AccessTokenRepository,
  type AccessTokenSecret,
} from '../entity/user/access-token.ts';
import type { UserAccount, UserAccountRepository } from '../entity/user/user-account.ts';
import { Exception } from './exception.ts';
import type { FromRepository } from './repository.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
}

/** 指定されたシークレットに対応するアクセストークンが正しいかどうかを検証し、アクセストークンに対応するユーザアカウントを返す。 */
export const verifyAccessToken = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{
  readonly userAccount: FromRepository<UserAccount>;
  readonly accessToken: FromRepository<AccessToken> & { readonly status: 'valid' };
}> => {
  const accessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  if (accessToken === undefined || !AccessTokenReducers.isValid(accessToken)) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  const userAccount = await params.userAccountRepository.getOneById(accessToken.logInUserId);
  if (userAccount === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  return { userAccount, accessToken };
};
