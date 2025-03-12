import {
  type AccessToken,
  AccessTokenReducers,
  type AccessTokenRepository,
  type AccessTokenSecret,
} from '../entity/user/access-token.ts';
import {
  type CertifiedUserProfile,
  CertifiedUserProfileReducers,
  type CertifiedUserProfileRepository,
} from '../entity/user/certified-user-profile.ts';
import type { UserAccount, UserAccountRepository } from '../entity/user/user-account.ts';
import type { UserId } from '../entity/user/values.ts';
import { Exception } from './exception.ts';
import type { FromRepository } from './repository.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
  readonly certifiedUserProfileRepository: CertifiedUserProfileRepository;
}

/** 指定されたシークレットに対応するアクセストークンが有効であるかを検証し、アクセストークンに対応するユーザアカウントを返す。 */
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

/** 指定されたユーザが有効な認証済みユーザプロフィールを持っているかどうかを検証し、指定されたユーザに対応する認証済みユーザプロフィールを返す。 */
export const verifyCertifiedUser = async (
  params: { readonly userId: UserId } & AccessControlServiceDependencies,
): Promise<{
  readonly certifiedUserProfile: FromRepository<CertifiedUserProfile> & {
    readonly status: 'valid';
  };
}> => {
  const certifiedUserProfile = await params.certifiedUserProfileRepository.getOneByCertifiedUserId(
    params.userId,
  );
  if (
    certifiedUserProfile === undefined ||
    !CertifiedUserProfileReducers.isValid(certifiedUserProfile)
  ) {
    throw Exception.create({ exceptionName: 'accessControl.notCertified' });
  }

  return { certifiedUserProfile };
};
