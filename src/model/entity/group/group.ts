import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
  PreAppliedVerifyAccessToken,
  PreAppliedVerifyCertifiedUser,
  PreAppliedVerifyGroupAdmin,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateId } from '../../lib/random-values/id.ts';
import type { DisplayName, Name } from '../../values.ts';
import type { FileId, FileRepository } from '../file/file.ts';
import type { ItemRepository } from '../item/item.ts';
import type { BadgeRepository } from './badge.ts';
import type { BadgeType } from './badge-type.ts';
import {
  type GroupInvitation,
  GroupInvitationReducers,
  type GroupInvitationRepository,
  type GroupMemberRepository,
  MemberReducers,
} from './member.ts';
import type { PermissionRepository } from './permission.ts';
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
  readonly iconFileId: FileId | undefined;
  readonly createdAt: Date;
  readonly roleInInstance: 'admin' | 'normal';
};

export const groupProfileTypeSymbol = Symbol('groupProfile.type');

export type GroupProfile = Group & {
  readonly [groupProfileTypeSymbol]: typeof groupProfileTypeSymbol;
  readonly badges: readonly BadgeType[];
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
      iconFileId: undefined,
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
      iconFileId: undefined,
      createdAt: new Date(),
      roleInInstance: 'admin',
    }) as const,

  update: <
    S extends Group,
    P extends {
      readonly name: TName;
      readonly displayName: TDisplayName;
      readonly iconFileId: TIconFileId;
    },
    TName extends Name,
    TDisplayName extends DisplayName,
    TIconFileId extends FileId | undefined,
  >(
    self: S,
    params: P,
  ): S & Pick<P, 'name' | 'displayName'> =>
    ({
      ...self,
      name: params.name,
      displayName: params.displayName,
      iconFileId: params.iconFileId,
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

  getDetailedOneById<TId extends GroupId>(
    this: GroupRepository,
    id: TId,
  ): Promise<FromRepository<GroupProfile & { readonly id: TId }> | undefined>;

  getMany(
    this: GroupRepository,
    params: {
      readonly filters?: Filters<Group>;
      readonly orderBy: OrderBy<Group>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<Group>[] | readonly []>;

  getDetailedMany(
    this: GroupRepository,
    params: {
      readonly filters?: Filters<Group>;
      readonly orderBy: OrderBy<Group>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<GroupProfile>[] | readonly []>;

  count(this: GroupRepository, params: { readonly filters?: Filters<Group> }): Promise<number>;

  createOne(this: GroupRepository, group: Group): Promise<void>;

  updateOne(this: GroupRepository, group: FromRepository<Group>): Promise<void>;

  deleteOneById(this: GroupRepository, groupId: GroupId): Promise<void>;
}
//#endregion

//#region GroupService
export interface GroupServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyCertifiedUser: PreApplied<
    PreAppliedVerifyCertifiedUser,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupAdmin: PreApplied<
    PreAppliedVerifyGroupAdmin,
    AccessControlServiceDependencies
  >;
  readonly groupRepository: GroupRepository;
  readonly groupInvitationRepository: GroupInvitationRepository;
  readonly groupMemberRepository: GroupMemberRepository;
  readonly permissionRepository: PermissionRepository;
  readonly badgeRepository: BadgeRepository;
  readonly itemRepository: ItemRepository;
  readonly fileRepository: FileRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * グループの情報を取得する。
 */
export const getOne = async (
  params: { readonly groupId: GroupId } & GroupServiceDependencies,
): Promise<{ readonly group: GroupProfile }> => {
  const group = await params.groupRepository.getDetailedOneById(params.groupId);
  if (group === undefined) {
    throw Exception.create({ exceptionName: 'group.notExists' });
  }

  return { group };
};

/**
 * グループの一覧を取得する。
 */
export const getMany = async (
  params: {
    readonly filters?: Filters<Group>;
    readonly orderBy: OrderBy<Group>;
    readonly offset?: number;
    readonly limit?: number;
    readonly detailed?: boolean | undefined;
  } & GroupServiceDependencies,
): Promise<{ readonly groups: readonly Group[] | readonly [] }> => {
  const groups =
    params.detailed === true
      ? await params.groupRepository.getDetailedMany({
          filters: params.filters,
          orderBy: params.orderBy,
          offset: params.offset,
          limit: params.limit,
        })
      : await params.groupRepository.getMany({
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
export const createOne = async <TName extends Name, TDisplayName extends DisplayName>(
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
 * グループの情報を更新する。
 * - この操作を行おうとするユーザは、グループの管理者である必要がある。
 */
export const updateOne = async (
  params: {
    readonly groupId: GroupId;
    readonly name: Name;
    readonly displayName: DisplayName;
    readonly iconFileId: FileId | undefined;
  } & GroupServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: myUserAccount.id });

  const group = await params.groupRepository.getOneById(params.groupId);
  if (group === undefined) {
    throw Exception.create({ exceptionName: 'group.notExists' });
  }

  const updatedGroup = GroupReducers.update(group, {
    name: params.name,
    displayName: params.displayName,
    iconFileId: params.iconFileId,
  });
  await params.groupRepository.updateOne(updatedGroup);
};

/**
 * 指定されたグループを削除する。
 * - この操作を行おうとするユーザは、グループの管理者である必要がある。
 * - グループが作成したアイテム、グループがアップロードしたファイル、グループに付与されているバッジ、グループに付与されている権限も同時に削除される。
 */
export const deleteOne = async (
  params: { readonly groupId: GroupId } & GroupServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupAdmin({ groupId: params.groupId, userId: myUserAccount.id });

  const group = await params.groupRepository.getOneById(params.groupId);
  if (group?.roleInInstance === 'admin') {
    throw Exception.create({ exceptionName: 'group.deletingInstanceAdmin' });
  }

  await params.itemRepository.deleteMany({ filters: { ownedBy: params.groupId } });
  await params.fileRepository.deleteMany({ filters: { ownedBy: params.groupId } });
  await params.badgeRepository.deleteMany({ filters: { groupId: params.groupId } });
  await params.permissionRepository.deleteMany({
    filters: { grantedTo: { groupId: params.groupId } },
  });
  await params.groupInvitationRepository.deleteOneById(params.groupId);
  await params.groupMemberRepository.deleteMany({ filters: { groupId: params.groupId } });
  await params.groupRepository.deleteOneById(params.groupId);
};
//#endregion
