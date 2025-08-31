import type { FromRepository } from '@mgn901/mgn901-utils-ts/repository-utils';
import { type GroupMemberRepository, type Member, MemberReducers } from '../entity/group/member.ts';
import type { PermissionRepository, PermissionType } from '../entity/group/permission.ts';
import type { GroupId } from '../entity/group/values.ts';
import type { ItemTypeName } from '../entity/item/item-type.ts';
import type {
  AccessToken,
  AccessTokenRepository,
  AccessTokenSecret,
} from '../entity/user/access-token.ts';
import type { MembershipRepository } from '../entity/user/membership.ts';
import type { UserAccount, UserAccountRepository } from '../entity/user/user-account.ts';
import type {
  UserCertification,
  UserCertificationRepository,
} from '../entity/user/user-certification.ts';
import type { UserId } from '../entity/user/values.ts';
import { Exception } from './exception.ts';

export interface AccessControlServiceDependencies {
  readonly accessTokenRepository: AccessTokenRepository;
  readonly userAccountRepository: UserAccountRepository;
  readonly userCertificationRepository: UserCertificationRepository;
  readonly groupMemberRepository: GroupMemberRepository;
  readonly membershipRepository: MembershipRepository;
  readonly permissionRepository: PermissionRepository;
}

/** 指定されたシークレットに対応するアクセストークンが有効であるかを検証し、アクセストークンに対応するユーザアカウントを返す。 */
export const verifyAccessToken = async (
  params: { readonly accessTokenSecret: AccessTokenSecret } & AccessControlServiceDependencies,
): Promise<{
  readonly myUserAccount: FromRepository<UserAccount>;
  readonly myAccessToken: FromRepository<AccessToken>;
}> => {
  const myAccessToken = await params.accessTokenRepository.getOneBySecret(params.accessTokenSecret);
  const myUserAccount = myAccessToken?.id
    ? await params.userAccountRepository.getOneById(myAccessToken.logInUserId)
    : undefined;
  if (
    myAccessToken === undefined ||
    myAccessToken.expiredAt < new Date() ||
    myUserAccount === undefined
  ) {
    throw Exception.create({ exceptionName: 'accessControl.notAuthorized' });
  }

  const updatedAccessToken = { ...myAccessToken, lastUsedAt: new Date() };
  await params.accessTokenRepository.updateOne(updatedAccessToken);

  return { myUserAccount, myAccessToken };
};

export type PreAppliedVerifyAccessToken = (
  params: Omit<Parameters<typeof verifyAccessToken>[0], keyof AccessControlServiceDependencies>,
) => ReturnType<typeof verifyAccessToken>;

/** 指定されたユーザが有効な証明書を持っているかどうかを検証し、指定されたユーザに対応する証明書を返す。 */
export const verifyCertifiedUser = async <TUserId extends UserId>(
  params: { readonly userId: TUserId } & AccessControlServiceDependencies,
): Promise<{
  readonly userCertification: FromRepository<UserCertification> & {
    readonly certifiedUserId: TUserId;
  };
}> => {
  const [newestNonexpiredCertification] = await params.userCertificationRepository.getMany({
    filters: { certifiedUserId: params.userId, expiredAt: ['gt', new Date()] },
    orderBy: { certifiedAt: 'desc' },
    limit: 1,
  });
  if (newestNonexpiredCertification === undefined) {
    throw Exception.create({ exceptionName: 'accessControl.notCertified' });
  }

  return {
    userCertification: newestNonexpiredCertification as FromRepository<UserCertification> & {
      readonly certifiedUserId: TUserId;
    },
  };
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
