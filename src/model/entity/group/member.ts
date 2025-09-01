import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
  PreAppliedVerifyAccessToken,
  PreAppliedVerifyCertifiedUser,
  PreAppliedVerifyGroupAdmin,
  PreAppliedVerifyGroupMember,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateShortSecret, type ShortSecret } from '../../lib/random-values/short-secret.ts';
import type { UserId } from '../user/user-account.ts';
import type { GroupRepository } from './group.ts';
import type { GroupId } from './values.ts';

//#region Member
const memberTypeSymbol = Symbol('member.type');

/**
 * グループに所属するメンバーを表す。
 */
export type Member = {
  readonly [memberTypeSymbol]: typeof memberTypeSymbol;
  readonly userId: UserId;
  readonly groupId: GroupId;
  readonly joinedAt: Date;
  readonly roleInGroup: 'admin' | 'normal';
};

/**
 * {@linkcode Member}の状態を変更するための関数を提供する。
 */
export const MemberReducers = {
  create: <
    P extends { readonly userId: TUserId; readonly groupId: TGroupId },
    TUserId extends UserId,
    TGroupId extends GroupId,
  >(
    params: P,
  ): Member & { readonly roleInGroup: 'normal' } & Pick<P, 'userId' | 'groupId'> =>
    ({
      [memberTypeSymbol]: memberTypeSymbol,
      userId: params.userId,
      groupId: params.groupId,
      joinedAt: new Date(),
      roleInGroup: 'normal',
    }) as const,

  toAdmin: <S extends Member>(self: S): S & { readonly roleInGroup: 'admin' } =>
    ({ ...self, roleInGroup: 'admin' }) as const,

  toNormalMember: <S extends Member>(self: S): S & { readonly roleInGroup: 'normal' } =>
    ({ ...self, roleInGroup: 'normal' }) as const,

  isAdmin: <S extends Member>(self: S): self is S & { readonly roleInGroup: 'admin' } =>
    self.roleInGroup === 'admin',
};

/**
 * {@linkcode Member}を永続化するためのリポジトリ。
 */
export interface GroupMemberRepository {
  getOne<TGroupId extends GroupId, TUserId extends UserId>(
    this: GroupMemberRepository,
    params: { readonly groupId: TGroupId; readonly userId: TUserId },
  ): Promise<
    FromRepository<Member & { readonly groupId: TGroupId; readonly userId: TUserId }> | undefined
  >;

  getMany(params: {
    readonly filters?: Filters<Member>;
    readonly orderBy: OrderBy<Member>;
    readonly offset?: number;
    readonly limit?: number;
  }): Promise<readonly FromRepository<Member>[] | readonly []>;

  createOne(this: GroupMemberRepository, member: Member): Promise<void>;

  updateOne(this: GroupMemberRepository, member: FromRepository<Member>): Promise<void>;

  deleteOne(
    this: GroupMemberRepository,
    params: { readonly groupId: GroupId; readonly userId: UserId },
  ): Promise<void>;

  deleteMany(
    this: GroupMemberRepository,
    params: { readonly filters: Filters<Member> },
  ): Promise<void>;
}
//#endregion

//#region GroupInvitation
export const groupInvitationTypeSymbol = Symbol('groupInvitation.type');
export const groupInvitationInvitationCodeTypeSymbol = Symbol('groupInvitation.invitationCode');
export type GroupInvitationInvitationCode = NominalPrimitive<
  ShortSecret,
  typeof groupInvitationTypeSymbol
>;

/**
 * グループへの招待に関する情報を表す。
 */
export type GroupInvitation = {
  readonly [groupInvitationTypeSymbol]: typeof groupInvitationTypeSymbol;
  readonly groupId: GroupId;
  readonly [groupInvitationInvitationCodeTypeSymbol]: GroupInvitationInvitationCode;
};

/**
 * {@linkcode GroupInvitation}の状態を変更するための関数を提供する。
 */
export const GroupInvitationReducers = {
  create: <P extends { readonly groupId: TGroupId }, TGroupId extends GroupId>(
    params: P,
  ): GroupInvitation & Pick<P, 'groupId'> =>
    ({
      [groupInvitationTypeSymbol]: groupInvitationTypeSymbol,
      groupId: params.groupId,
      [groupInvitationInvitationCodeTypeSymbol]:
        generateShortSecret() as GroupInvitationInvitationCode,
    }) as const,

  toInvitationCodeReset: <S extends GroupInvitation>(
    self: S,
  ): S & {
    readonly [groupInvitationInvitationCodeTypeSymbol]: GroupInvitationInvitationCode;
  } =>
    ({
      ...self,
      [groupInvitationInvitationCodeTypeSymbol]:
        generateShortSecret() as GroupInvitationInvitationCode,
    }) as const,
};

/**
 * {@linkcode GroupInvitation}を永続化するためのリポジトリ。
 */
export interface GroupInvitationRepository {
  getOneById<TId extends GroupId>(
    this: GroupInvitationRepository,
    groupId: TId,
  ): Promise<FromRepository<GroupInvitation & { readonly groupId: TId }> | undefined>;

  getMany(
    this: GroupInvitationRepository,
    params: {
      readonly filters?: Filters<GroupInvitation>;
      readonly orderBy: OrderBy<GroupInvitation>;
      readonly offset?: number;
      readonly limit?: number;
    },
  ): Promise<readonly FromRepository<GroupInvitation>[] | readonly []>;

  createOne(this: GroupInvitationRepository, invitation: GroupInvitation): Promise<void>;

  updateOne(
    this: GroupInvitationRepository,
    invitation: FromRepository<GroupInvitation>,
  ): Promise<void>;

  deleteOneById(this: GroupInvitationRepository, groupId: GroupId): Promise<void>;
}
//#endregion

//#region GroupMemberService
export interface GroupMemberServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyCertifiedUser: PreApplied<
    PreAppliedVerifyCertifiedUser,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    PreAppliedVerifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupAdmin: PreApplied<
    PreAppliedVerifyGroupAdmin,
    AccessControlServiceDependencies
  >;
  readonly groupRepository: GroupRepository;
  readonly groupMemberRepository: GroupMemberRepository;
  readonly groupInvitationRepository: GroupInvitationRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたグループの招待コードを作成する。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っていて、グループの管理者である必要がある。
 * @throws 指定されたグループの招待コードが既に存在する場合、{@linkcode Exception}（`groupInvitation.alreadyExists`）を投げる。
 */
export const createInvitation = async <TGroupId extends GroupId>(
  params: { readonly groupId: TGroupId } & GroupMemberServiceDependencies,
): Promise<{ readonly groupInvitation: GroupInvitation & { readonly groupId: TGroupId } }> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: userAccount.id });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: userAccount.id });

  const groupInvitation = await params.groupInvitationRepository.getOneById(params.groupId);
  if (groupInvitation !== undefined) {
    throw Exception.create({ exceptionName: 'groupInvitation.alreadyExists' });
  }

  const groupInvitationCreated = GroupInvitationReducers.create({ groupId: params.groupId });
  await params.groupInvitationRepository.createOne(groupInvitationCreated);

  return { groupInvitation: groupInvitationCreated };
};

/**
 * 指定されたグループの招待コードをリセットする。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っていて、グループの管理者である必要がある。
 * @throws 指定されたグループの招待が存在しない場合、{@linkcode Exception}（`groupInvitation.notExists`）を投げる。
 */
export const resetInvitationCode = async <TGroupId extends GroupId>(
  params: { readonly groupId: TGroupId } & GroupMemberServiceDependencies,
): Promise<{ readonly groupInvitation: GroupInvitation & { readonly groupId: TGroupId } }> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: userAccount.id });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: userAccount.id });

  const groupInvitation = await params.groupInvitationRepository.getOneById(params.groupId);
  if (groupInvitation === undefined) {
    throw Exception.create({ exceptionName: 'groupInvitation.notExists' });
  }

  const groupInvitationCodeReset = GroupInvitationReducers.toInvitationCodeReset(groupInvitation);
  await params.groupInvitationRepository.updateOne(groupInvitationCodeReset);

  return { groupInvitation };
};

/**
 * 指定されたグループの招待コードを削除する。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っていて、グループの管理者である必要がある。
 */
export const deleteInvitation = async (
  params: { readonly groupId: GroupId } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: userAccount.id });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: userAccount.id });

  await params.groupInvitationRepository.deleteOneById(params.groupId);
};

/**
 * 招待コードを用いて指定されたグループに参加する。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っている必要がある。
 * @throws 指定されたグループの招待が存在しない場合、{@linkcode Exception}（`groupInvitation.notExists`）を投げる。
 * @throws 招待コードが正しくない場合、{@linkcode Exception}（`groupInvitation.invitationCodeIncorrect`）を投げる。
 */
export const joinGroup = async (
  params: {
    readonly groupId: GroupId;
    readonly enteredInvitationCode: GroupInvitationInvitationCode;
  } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: userAccount.id });

  const groupInvitation = await params.groupInvitationRepository.getOneById(params.groupId);
  if (groupInvitation === undefined) {
    throw Exception.create({ exceptionName: 'groupInvitation.notExists' });
  }

  if (params.enteredInvitationCode !== groupInvitation[groupInvitationInvitationCodeTypeSymbol]) {
    throw Exception.create({ exceptionName: 'groupInvitation.invitationCodeIncorrect' });
  }

  await params.groupMemberRepository.createOne(
    MemberReducers.create({ groupId: groupInvitation.groupId, userId: userAccount.id }),
  );
};

/**
 * 指定されたグループから退出する。
 */
export const leaveGroup = async (
  params: { readonly groupId: GroupId } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  await params.groupMemberRepository.deleteOne({
    groupId: params.groupId,
    userId: myUserAccount.id,
  });
};

/**
 * 指定されたメンバーを管理者にする。
 * - この操作を行おうとするユーザは、グループの管理者である必要がある。有効な認証済みユーザプロフィールを持っている必要はない。
 */
export const makeAdmin = async (
  params: { readonly groupId: GroupId; readonly userId: UserId } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: userAccount.id });

  const { member } = await params.verifyGroupMember({
    groupId: params.groupId,
    userId: params.userId,
  });
  const newAdmin = MemberReducers.toAdmin(member);
  await params.groupMemberRepository.updateOne(newAdmin);
};

/**
 * 指定されたメンバーを管理者から通常メンバーにする。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っていて、グループの管理者である必要がある。
 * @throws 操作を行おうとする時点で管理者が1人しかいない場合、{@linkcode Exception}（`groupMember.onlyOneAdmin`）を投げる。
 */
export const makeNormalMember = async (
  params: { readonly groupId: GroupId; readonly userId: UserId } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount: userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: userAccount.id }); // 認証済みユーザでないと他の管理者を降格することはできない。
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: userAccount.id });

  const { member } = await params.verifyGroupMember({
    groupId: params.groupId,
    userId: params.userId,
  });

  const admins = await params.groupMemberRepository.getMany({
    filters: { groupId: params.groupId, roleInGroup: 'admin' },
    orderBy: { userId: 'asc' },
  });
  if (admins.length === 1) {
    throw Exception.create({ exceptionName: 'groupMember.deletingOnlyOneAdmin' });
  }

  const newNormalMember = MemberReducers.toNormalMember(member);
  await params.groupMemberRepository.updateOne(newNormalMember);
};

/**
 * 指定されたメンバーを指定されたグループから退出させる。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っていて、グループの管理者である必要がある。
 */
export const kick = async (
  params: { readonly groupId: GroupId; readonly userId: UserId } & GroupMemberServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: myUserAccount.id });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: myUserAccount.id });

  await params.groupMemberRepository.deleteOne({
    groupId: params.groupId,
    userId: params.userId,
  });
};
//#endregion
