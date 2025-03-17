import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyCertifiedUser,
  verifyGroupAdmin,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { generateId } from '../../lib/random-values/id.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { DisplayName, Name } from '../../values.ts';
import {
  type GroupInvitation,
  GroupInvitationReducers,
  type GroupInvitationRepository,
  type GroupMemberRepository,
  MemberReducers,
} from './member.ts';
import { type GroupId, groupTypeSymbol } from './values.ts';

//#region Group and GroupRepository

/**
 * グループを表す。
 */
export type Group = {
  readonly [groupTypeSymbol]: typeof groupTypeSymbol;
  readonly id: GroupId;
  readonly name: Name;
  readonly displayName: DisplayName;
  readonly createdAt: Date;
  readonly roleInInstance: 'admin' | 'normal';
};

/**
 * {@linkcode Group}の状態を変更するための関数を提供する。
 */
export const GroupReducers = {
  create: <
    P extends { readonly name: TName; readonly displayName: TDisplayName },
    TName extends Name,
    TDisplayName extends DisplayName,
  >(
    params: P,
  ): Group & { readonly roleInInstance: 'normal' } & Pick<P, 'name' | 'displayName'> =>
    ({
      [groupTypeSymbol]: groupTypeSymbol,
      id: generateId() as GroupId,
      name: params.name,
      displayName: params.displayName,
      createdAt: new Date(),
      roleInInstance: 'normal',
    }) as const,

  createInstanceAdmin: <
    P extends { readonly name: TName; readonly displayName: TDisplayName },
    TName extends Name,
    TDisplayName extends DisplayName,
  >(
    params: P,
  ): Group & { readonly roleInInstance: 'admin' } & Pick<P, 'name' | 'displayName'> =>
    ({
      [groupTypeSymbol]: groupTypeSymbol,
      id: generateId() as GroupId,
      name: params.name,
      displayName: params.displayName,
      createdAt: new Date(),
      roleInInstance: 'admin',
    }) as const,
};

/**
 * {@linkcode Group}を永続化するためのリポジトリ。
 */
export interface GroupRepository {
  getOneById<TId extends GroupId>(
    this: GroupRepository,
    id: TId,
  ): Promise<FromRepository<Group & { readonly id: TId }> | undefined>;

  getMany(
    this: GroupRepository,
    params: {
      readonly filters?: Filters<Group>;
      readonly orderBy: OrderBy<Group>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<Group>[] | readonly []>;

  createOne(this: GroupRepository, group: Group): Promise<void>;

  updateOne(this: GroupRepository, group: FromRepository<Group>): Promise<void>;

  deleteOneById(this: GroupRepository, groupId: GroupId): Promise<void>;
}
//#endregion

//#region GroupService
export interface GroupServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyCertifiedUser: PreApplied<
    typeof verifyCertifiedUser,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupAdmin: PreApplied<typeof verifyGroupAdmin, AccessControlServiceDependencies>;
  readonly groupRepository: GroupRepository;
  readonly groupInvitationRepository: GroupInvitationRepository;
  readonly groupMemberRepository: GroupMemberRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * グループの一覧を取得する。
 */
export const getGroups = async (
  params: {
    readonly filters?: Filters<Group>;
    readonly orderBy: OrderBy<Group>;
    readonly offset?: number;
    readonly limit?: number;
  } & GroupServiceDependencies,
): Promise<{ readonly groups: readonly Group[] | readonly [] }> => {
  const groups = await params.groupRepository.getMany({
    filters: params.filters,
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit,
  });

  return { groups };
};

/**
 * 新しいグループを作成する。
 * - この操作を行おうとするユーザは、有効な認証済みユーザプロフィールを持っている必要がある。
 */
export const create = async <TName extends Name, TDisplayName extends DisplayName>(
  params: { readonly name: TName; readonly displayName: TDisplayName } & GroupServiceDependencies,
): Promise<{
  readonly group: Group & {
    readonly name: TName;
    readonly displayName: TDisplayName;
    readonly roleInInstance: 'normal';
  };
  readonly groupInvitation: GroupInvitation;
}> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyCertifiedUser({ userId: myUserAccount.id });

  const group = GroupReducers.create({ name: params.name, displayName: params.displayName });
  await params.groupRepository.createOne(group);

  const owner = MemberReducers.toAdmin(
    MemberReducers.create({ groupId: group.id, userId: myUserAccount.id }),
  );
  await params.groupMemberRepository.createOne(owner);

  const groupInvitation = GroupInvitationReducers.create({ groupId: group.id });
  await params.groupInvitationRepository.createOne(groupInvitation);

  return { group, groupInvitation };
};

/**
 * 指定されたグループを削除する。
 * - この操作を行おうとするユーザは、グループの管理者である必要がある。
 * - グループが作成したアイテムも同時に削除される。
 */
export const deleteGroup = async (
  params: { readonly groupId: GroupId } & GroupServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: myUserAccount.id });

  // TODO: アイテムの削除
  await params.groupInvitationRepository.deleteOne(params.groupId);
  await params.groupMemberRepository.deleteMany({ filters: { groupId: params.groupId } });
  await params.groupRepository.deleteOneById(params.groupId);
};
//#endregion
