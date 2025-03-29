import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyInstanceAdmin,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { ItemTypeName } from '../item/item-type.ts';
import type { GroupId } from './values.ts';

//#region Permission and PermissionRepository
export const permissionTypeSymbol = Symbol('permission.type');

export type PermissionGrantee = { readonly groupId: GroupId } | { readonly keyword: 'allGroups' };

export type PermissionType = 'create' | 'createTranslated' | 'update';

/**
 * グループに対する、ある種類のアイテムの作成や更新の許可を表す。
 */
export type Permission = {
  readonly [permissionTypeSymbol]: typeof permissionTypeSymbol;
  readonly grantedTo: PermissionGrantee;
  readonly itemTypeName: ItemTypeName;
  readonly permissionType: PermissionType;
};

/**
 * {@linkcode Permission}の状態を変更するための関数を提供する。
 */
export const PermissionReducers = {
  /**
   * 新しい{@linkcode Permission}を作成して返す。
   */
  create: <
    P extends {
      readonly grantedTo: PermissionGrantee;
      readonly itemTypeName: ItemTypeName;
      readonly permissionType: PermissionType;
    },
  >(
    params: P,
  ): Permission & Pick<P, 'grantedTo' | 'itemTypeName' | 'permissionType'> =>
    ({
      [permissionTypeSymbol]: permissionTypeSymbol,
      grantedTo: params.grantedTo,
      itemTypeName: params.itemTypeName,
      permissionType: params.permissionType,
    }) as const,

  /**
   * 指定された許可を更新して返す。
   * @param self 更新する許可を指定する。
   */
  update: <S extends Permission, P extends { readonly permissionType: PermissionType }>(
    self: S,
    params: P,
  ): S & Pick<P, 'permissionType'> => ({ ...self, permissionType: params.permissionType }) as const,
};

/**
 * {@linkcode Permission}を永続化するリポジトリ。
 */
export interface PermissionRepository {
  getOne<TGrantedTo extends PermissionGrantee, TItemTypeName extends ItemTypeName>(
    this: PermissionRepository,
    params: {
      readonly grantedTo: TGrantedTo;
      readonly itemTypeName: TItemTypeName;
    },
  ): Promise<
    | FromRepository<
        Permission & { readonly grantedTo: TGrantedTo; readonly itemTypeName: TItemTypeName }
      >
    | undefined
  >;

  getMany(
    this: PermissionRepository,
    params: {
      readonly filters?: Filters<Omit<Permission, 'grantedTo'>> & {
        readonly grantedTo: PermissionGrantee;
      };
      readonly orderBy: OrderBy<Permission & { readonly groupId: GroupId }>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<Permission>[] | readonly []>;

  count(
    this: PermissionRepository,
    params: {
      readonly filters?: Filters<Omit<Permission, 'grantedTo'>> & {
        readonly grantedTo: PermissionGrantee;
      };
    },
  ): Promise<number>;

  createOne(this: PermissionRepository, permission: Permission): Promise<void>;

  updateOne(this: PermissionRepository, permission: FromRepository<Permission>): Promise<void>;

  deleteOne(
    this: PermissionRepository,
    params: {
      readonly grantedTo: PermissionGrantee;
      readonly itemTypeName: ItemTypeName;
    },
  ): Promise<void>;

  deleteMany(
    this: PermissionRepository,
    params: {
      readonly filters: Filters<Omit<Permission, 'grantedTo'>> & {
        readonly grantedTo: PermissionGrantee;
      };
    },
  ): Promise<void>;
}
//#endregion

//#region PermissionService
export interface PermissionServiceDependencies {
  readonly permissionRepository: PermissionRepository;
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyInstanceAdmin: PreApplied<
    typeof verifyInstanceAdmin,
    AccessControlServiceDependencies
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたグループに付与されている許可の一覧を取得する。
 */
export const getManyGrantedToGroup = async (
  params: { readonly groupId: GroupId } & PermissionServiceDependencies,
): Promise<{ readonly permissions: readonly Permission[] }> => {
  const permissionsGrantedToGroup = await params.permissionRepository.getMany({
    filters: { grantedTo: { groupId: params.groupId } },
    orderBy: { itemTypeName: 'asc' },
  });
  const permissionsGrantedToAllGroups = await params.permissionRepository.getMany({
    filters: { grantedTo: { keyword: 'allGroups' } },
    orderBy: { itemTypeName: 'asc' },
  });
  return { permissions: [...permissionsGrantedToGroup, ...permissionsGrantedToAllGroups] };
};

/**
 * 許可を付与する。
 * - この操作を行おうとするユーザは、インスタンス管理グループに所属している必要がある。
 */
export const grant = async (
  params: {
    readonly grantedTo: PermissionGrantee;
    readonly itemTypeName: ItemTypeName;
    readonly permissionType: PermissionType;
  } & PermissionServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  const permission = PermissionReducers.create(params);
  await params.permissionRepository.createOne(permission);
};

/**
 * すでに付与されている許可の種類を更新する。
 * - この操作を行おうとするユーザは、インスタンス管理グループに所属している必要がある。
 * @throws そのグループに対してそのアイテムの種類についての許可が付与されていない場合、{@linkcode Exception}（`permission.notExists`）を投げる。
 */
export const update = async (
  params: {
    readonly grantedTo: PermissionGrantee;
    readonly itemTypeName: ItemTypeName;
    readonly permissionType: PermissionType;
  } & PermissionServiceDependencies,
) => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  const permission = await params.permissionRepository.getOne({
    grantedTo: params.grantedTo,
    itemTypeName: params.itemTypeName,
  });
  if (permission === undefined) {
    throw Exception.create({ exceptionName: 'permission.notExists' });
  }

  const permissionUpdated = PermissionReducers.update(permission, {
    permissionType: params.permissionType,
  });
  await params.permissionRepository.createOne(permissionUpdated);
};

/**
 * 許可を剥奪する。
 * - この操作を行おうとするユーザは、インスタンス管理グループに所属している必要がある。
 */
export const revoke = async (
  params: {
    readonly grantedTo: PermissionGrantee;
    readonly itemTypeName: ItemTypeName;
  } & PermissionServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  await params.permissionRepository.deleteOne(params);
};
//#endregion
