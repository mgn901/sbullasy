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
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { BadgeTypeName } from './badge-type.ts';
import type { GroupId } from './values.ts';

//#region Badge and BadgeRepository
export const badgeTypeSymbol = Symbol('badge.type');

/**
 * グループに付与されるバッジを表す。
 */
export type Badge = {
  readonly [badgeTypeSymbol]: typeof badgeTypeSymbol;
  readonly groupId: GroupId;
  readonly badgeTypeName: BadgeTypeName;
};

/**
 * {@linkcode Badge}の状態を変更するための関数を提供する。
 */
export const BadgeReducers = {
  /**
   * 新しいバッジを作成して返す。
   */
  create: <
    P extends { readonly groupId: TGroupId; readonly badgeTypeName: TBadgeTypeName },
    TGroupId extends GroupId,
    TBadgeTypeName extends BadgeTypeName,
  >(
    params: P,
  ): Badge & Pick<P, 'groupId' | 'badgeTypeName'> =>
    ({
      [badgeTypeSymbol]: badgeTypeSymbol,
      groupId: params.groupId,
      badgeTypeName: params.badgeTypeName,
    }) as const,
};

/**
 * {@linkcode Badge}を永続化するためのリポジトリ。
 */
export interface BadgeRepository {
  getMany(
    this: BadgeRepository,
    params: {
      readonly filters?: Filters<Badge>;
      readonly orderBy: OrderBy<Badge>;
      readonly limit?: number;
      readonly offset?: number;
    },
  ): Promise<readonly FromRepository<Badge>[] | readonly []>;

  count(this: BadgeRepository, params: { readonly filters?: Filters<Badge> }): Promise<number>;

  createOne(this: BadgeRepository, badge: Badge): Promise<void>;

  deleteOne(
    this: BadgeRepository,
    params: { readonly groupId: GroupId; readonly badgeTypeName: BadgeTypeName },
  ): Promise<void>;

  deleteMany(this: BadgeRepository, params: { readonly filters: Filters<Badge> }): Promise<void>;
}
//#endregion

//#region BadgeService
export interface BadgeServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyInstanceAdmin: PreApplied<
    typeof verifyInstanceAdmin,
    AccessControlServiceDependencies
  >;
  readonly badgeRepository: BadgeRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたグループにバッジを付与する。
 * - この操作を行おうとしているユーザは、インスタンスの管理グループに所属している必要がある。
 */
export const grant = async (
  params: {
    readonly groupId: GroupId;
    readonly badgeTypeName: BadgeTypeName;
  } & BadgeServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  const badge = BadgeReducers.create({
    groupId: params.groupId,
    badgeTypeName: params.badgeTypeName,
  });
  await params.badgeRepository.createOne(badge);
};

/**
 * 指定されたグループからバッジを剥奪する。
 * - この操作を行おうとしているユーザは、インスタンスの管理グループに所属している必要がある。
 */
export const revoke = async (
  params: {
    readonly groupId: GroupId;
    readonly badgeTypeName: BadgeTypeName;
  } & BadgeServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  await params.badgeRepository.deleteOne({
    groupId: params.groupId,
    badgeTypeName: params.badgeTypeName,
  });
};
//#endregion
