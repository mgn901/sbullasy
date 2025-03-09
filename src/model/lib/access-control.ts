import type { AccessTokenRepository, AccessTokenSecret } from '../entity/user/access-token.ts';
import {
  type UserAccount,
  UserAccountRegistrationRequested,
  type UserAccountRepository,
} from '../entity/user/user-account.ts';
import { Exception } from './exception.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
}

/** 指定されたシークレットに対応するアクセストークンが正しいかどうかを検証し、アクセストークンに対応するユーザアカウントを返す。 */
export const verifyAccessTokenAndGetLogInUserAccount = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{ readonly userAccount: UserAccount }> => {
  const accessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  if (accessToken === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  const userAccount = await params.userAccountRepository.getOneById(accessToken.logInUserId);
  if (userAccount === undefined || userAccount instanceof UserAccountRegistrationRequested) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  return { userAccount };
};
