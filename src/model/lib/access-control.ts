import type { AccessTokenRepository, AccessTokenSecret } from '../entity/user/access-token.ts';
import {
  type UserAccount,
  UserAccountEmailAddressUpdateRequested,
  UserAccountRegistered,
  type UserAccountRepository,
} from '../entity/user/user-account.ts';
import { Exception } from './exception.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
}

export const verifyAccessTokenAndGetLoginUserAccount = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{ readonly userAccount: UserAccount }> => {
  const accessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  if (accessToken === undefined) {
    throw new Exception({ exceptionName: 'accessControl.notAuthorized' });
  }

  const userAccount = await params.userAccountRepository.getOneById(accessToken.loginUserId);
  if (
    userAccount instanceof UserAccountRegistered === false &&
    userAccount instanceof UserAccountEmailAddressUpdateRequested === false
  ) {
    throw new Exception({ exceptionName: 'accessControl.notAuthorized' });
  }

  return { userAccount };
};
