import {
  type AccessTokenRepository,
  type AccessTokenSecret,
  AccessTokenValid,
} from '../entity/user/access-token.ts';
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
export const verifyAccessToken = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{
  readonly userAccount: Exclude<UserAccount, UserAccountRegistrationRequested>;
  readonly accessToken: AccessTokenValid;
}> => {
  const accessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  if (accessToken instanceof AccessTokenValid === false) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  const userAccount = await params.userAccountRepository.getOneById(accessToken.logInUserId);
  if (userAccount === undefined || userAccount instanceof UserAccountRegistrationRequested) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  return { userAccount, accessToken };
};
