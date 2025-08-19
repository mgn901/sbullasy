import type { FromRepository } from '@mgn901/mgn901-utils-ts/repository-utils';
import { type GroupMemberRepository, type Member, MemberReducers } from '../entity/group/member.ts';
import type { PermissionRepository, PermissionType } from '../entity/group/permission.ts';
import type { GroupId } from '../entity/group/values.ts';
import type { ItemTypeName } from '../entity/item/item-type.ts';
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
import type { MembershipRepository } from '../entity/user/membership.ts';
import type { UserAccount, UserAccountRepository } from '../entity/user/user-account.ts';
import type { UserId } from '../entity/user/values.ts';
import { Exception } from './exception.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
  readonly certifiedUserProfileRepository: CertifiedUserProfileRepository;
  readonly groupMemberRepository: GroupMemberRepository;
  readonly membershipRepository: MembershipRepository;
  readonly permissionRepository: PermissionRepository;
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

  const myUserAccount = await params.userAccountRepository.getOneById(myAccessToken.logInUserId);
  if (myUserAccount === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  const myAccessTokenUpdated = AccessTokenReducers.toLastUsedAtUpdated(myAccessToken);
  await params.accessTokenRepository.updateOne(myAccessTokenUpdated);

  return { myUserAccount, myAccessToken: myAccessTokenUpdated };
};

export type PreAppliedVerifyAccessToken = (
  params: Omit<Parameters<typeof verifyAccessToken>[0], keyof AccessControlServiceDependencies>,
) => ReturnType<typeof verifyAccessToken>;

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

export type PreAppliedVerifyCertifiedUser = <TUserId extends UserId>(
  params: Omit<
    Parameters<typeof verifyCertifiedUser<TUserId>>[0],
    keyof AccessControlServiceDependencies
  >,
) => ReturnType<typeof verifyCertifiedUser<TUserId>>;

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

export type PreAppliedVerifyGroupMember = <TUserId extends UserId, TGroupId extends GroupId>(
  params: Omit<
    Parameters<typeof verifyGroupMember<TUserId, TGroupId>>[0],
    keyof AccessControlServiceDependencies
  >,
) => ReturnType<typeof verifyGroupMember<TUserId, TGroupId>>;

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

export type PreAppliedVerifyGroupAdmin = <TUserId extends UserId, TGroupId extends GroupId>(
  params: Omit<
    Parameters<typeof verifyGroupAdmin<TUserId, TGroupId>>[0],
    keyof AccessControlServiceDependencies
  >,
) => ReturnType<typeof verifyGroupAdmin<TUserId, TGroupId>>;

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

export type PreAppliedVerifyInstanceAdmin = (
  params: Omit<Parameters<typeof verifyInstanceAdmin>[0], keyof AccessControlServiceDependencies>,
) => ReturnType<typeof verifyInstanceAdmin>;

export const verifyItemOperationPermission = async (
  params: {
    readonly groupId: GroupId;
    readonly itemTypeName: ItemTypeName;
    readonly permissionType: PermissionType;
  } & AccessControlServiceDependencies,
): Promise<void> => {
  const permission = await params.permissionRepository.getOne({
    grantedTo: { groupId: params.groupId },
    itemTypeName: params.itemTypeName,
  });
  const permissionGrantedToAllGroups = await params.permissionRepository.getOne({
    grantedTo: { keyword: 'allGroups' },
    itemTypeName: params.itemTypeName,
  });

  if (
    permission?.permissionType !== params.permissionType &&
    permissionGrantedToAllGroups?.permissionType !== params.permissionType
  ) {
    throw Exception.create({ exceptionName: 'accessControl.notPermitted' });
  }
};

export type PreAppliedVerifyItemOperationPermission = (
  params: Omit<
    Parameters<typeof verifyItemOperationPermission>[0],
    keyof AccessControlServiceDependencies
  >,
) => ReturnType<typeof verifyItemOperationPermission>;
export const accessTokenSecretSymbol: unique symbol = Symbol('accessTokenSecret');
