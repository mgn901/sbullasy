import { type GroupMemberRepository, type Member, MemberReducers } from '../entity/group/member.ts';
import type { MembershipRepository } from '../entity/group/membership.ts';
import type { GroupId } from '../entity/group/values.ts';
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
  readonly groupMemberRepository: GroupMemberRepository;
  readonly membershipRepository: MembershipRepository;
}

/** 指定されたシークレットに対応するアクセストークンが有効であるかを検証し、アクセストークンに対応するユーザアカウントを返す。 */
export const verifyAccessToken = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{
  readonly myUserAccount: FromRepository<UserAccount>;
  readonly myAccessToken: FromRepository<AccessToken> & { readonly status: 'valid' };
}> => {
  const myAccessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  if (myAccessToken === undefined || !AccessTokenReducers.isValid(myAccessToken)) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }
  const myAccessTokenUpdated = AccessTokenReducers.toLastUsedAtUpdated(myAccessToken);
  await params.accessTokenRepository.updateOne(myAccessTokenUpdated);

  const myUserAccount = await params.userAccountRepository.getOneById(myAccessToken.logInUserId);
  if (myUserAccount === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  return { myUserAccount, myAccessToken: myAccessTokenUpdated };
};

/** 指定されたユーザが有効な認証済みユーザプロフィールを持っているかどうかを検証し、指定されたユーザに対応する認証済みユーザプロフィールを返す。 */
export const verifyCertifiedUser = async <TUserId extends UserId>(
  params: { readonly userId: TUserId } & AccessControlServiceDependencies,
): Promise<{
  readonly certifiedUserProfile: FromRepository<CertifiedUserProfile> & {
    readonly certifiedUserId: TUserId;
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

/** 指定されたユーザが指定されたグループのメンバーであるかどうかを検証し、それに対応するメンバーの情報を返す。 */
export const verifyGroupMember = async <TUserId extends UserId, TGroupId extends GroupId>(
  params: {
    readonly userId: TUserId;
    readonly groupId: TGroupId;
  } & AccessControlServiceDependencies,
): Promise<{
  readonly member: FromRepository<Member> & {
    readonly userId: TUserId;
    readonly groupId: TGroupId;
  };
}> => {
  const member = await params.groupMemberRepository.getOne({
    groupId: params.groupId,
    userId: params.userId,
  });
  if (member === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notGroupMember' });
  }

  return { member };
};

/** 指定されたユーザが指定されたグループの管理者であるかどうかを検証し、それに対応するメンバーの情報を返す。 */
export const verifyGroupAdmin = async <TUserId extends UserId, TGroupId extends GroupId>(
  params: {
    readonly userId: TUserId;
    readonly groupId: TGroupId;
  } & AccessControlServiceDependencies,
): Promise<{
  readonly member: FromRepository<Member> & {
    readonly userId: TUserId;
    readonly groupId: TGroupId;
    readonly roleInGroup: 'admin';
  };
}> => {
  const member = await params.groupMemberRepository.getOne({
    groupId: params.groupId,
    userId: params.userId,
  });
  if (member === undefined || !MemberReducers.isAdmin(member)) {
    throw Exception.create({ exceptionName: 'accessControl.notGroupAdmin' });
  }

  return { member };
};

/** 指定されたユーザがインスタンス管理者のグループに所属しているかどうかを検証する。 */
export const verifyInstanceAdmin = async (
  params: { readonly userId: UserId } & AccessControlServiceDependencies,
): Promise<void> => {
  const groups = await params.membershipRepository.getMany({
    filters: { userId: params.userId, roleInInstance: 'admin' },
    orderBy: { groupId: 'asc' },
    limit: 1,
  });

  if (groups.length === 0) {
    throw Exception.create({ exceptionName: 'accessControl.notInstanceAdmin' });
  }
};
