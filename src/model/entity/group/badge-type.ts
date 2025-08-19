import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { Filters, FromRepository, OrderBy } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
  PreAppliedVerifyAccessToken,
  PreAppliedVerifyInstanceAdmin,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  I18nMap,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import type { Name } from '../../values.ts';

//#region BadgeType and BadgeTypeRepository
export const badgeTypeTypeSymbol = Symbol('badgeType.type');
export type BadgeTypeName = NominalPrimitive<Name, typeof badgeTypeTypeSymbol>;

/**
 * バッジの種類を表す。
 */
export type BadgeType = {
  readonly [badgeTypeTypeSymbol]: typeof badgeTypeTypeSymbol;
  readonly name: BadgeTypeName;
  readonly displayNameI18nMap: I18nMap;
  readonly descriptionI18nMap: I18nMap;
};

/**
 * {@linkcode BadgeType}の状態を変更するための関数を提供する。
 */
export const BadgeTypeReducers = {
  /**
   * 新しいバッジの種類を作成して返す。
   */
  create: <
    P extends {
      readonly name: TBadgeTypeName;
      readonly displayNameI18nMap: TDisplayNameI18nMap;
      readonly descriptionI18nMap: TDescriptionI18nMap;
    },
    TBadgeTypeName extends BadgeTypeName,
    TDisplayNameI18nMap extends I18nMap,
    TDescriptionI18nMap extends I18nMap,
  >(
    params: P,
  ): BadgeType & Pick<P, 'name' | 'displayNameI18nMap' | 'descriptionI18nMap'> =>
    ({
      [badgeTypeTypeSymbol]: badgeTypeTypeSymbol,
      name: params.name,
      displayNameI18nMap: params.displayNameI18nMap,
      descriptionI18nMap: params.descriptionI18nMap,
    }) as const,

  /**
   * 指定されたバッジの種類を更新して返す。
   * @param self 更新するバッジの種類を指定する。
   */
  update: <
    S extends BadgeType,
    P extends {
      readonly displayNameI18nMap: TDisplayNameI18nMap;
      readonly descriptionI18nMap: TDescriptionI18nMap;
    },
    TDisplayNameI18nMap extends I18nMap,
    TDescriptionI18nMap extends I18nMap,
  >(
    self: S,
    params: P,
  ): S & Pick<P, 'displayNameI18nMap' | 'descriptionI18nMap'> =>
    ({
      ...self,
      displayNameI18nMap: params.displayNameI18nMap,
      descriptionI18nMap: params.descriptionI18nMap,
    }) as const,
};

/**
 * {@linkcode BadgeType}を永続化するためのリポジトリ。
 */
export interface BadgeTypeRepository {
  getOneByName<TBadgeTypeName extends BadgeTypeName>(
    this: BadgeTypeRepository,
    name: TBadgeTypeName,
  ): Promise<FromRepository<BadgeType & { readonly badgeTypeName: TBadgeTypeName }> | undefined>;

  getMany(
    this: BadgeTypeRepository,
    params: {
      readonly filters?: Filters<BadgeType>;
      readonly orderBy: OrderBy<BadgeType>;
      readonly limit?: number;
      readonly offset?: number;
    },
  ): Promise<readonly FromRepository<BadgeType>[] | readonly []>;

  count(
    this: BadgeTypeRepository,
    params: { readonly filters?: Filters<BadgeType> },
  ): Promise<number>;

  createOne(this: BadgeTypeRepository, badgeType: BadgeType): Promise<void>;

  updateOne(this: BadgeTypeRepository, badgeType: FromRepository<BadgeType>): Promise<void>;

  deleteOneByName(this: BadgeTypeRepository, name: BadgeTypeName): Promise<void>;
}
//#endregion

//#region BadgeTypeService
export interface BadgeTypeServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyInstanceAdmin: PreApplied<
    PreAppliedVerifyInstanceAdmin,
    AccessControlServiceDependencies
  >;
  readonly badgeTypeRepository: BadgeTypeRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * バッジの種類を作成する。
 * - この操作を行おうとしているユーザは、インスタンスの管理グループに所属している必要がある。
 */
export const createOne = async (
  params: {
    readonly name: BadgeTypeName;
    readonly displayNameI18nMap: I18nMap;
    readonly descriptionI18nMap: I18nMap;
  } & BadgeTypeServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  const badgeType = BadgeTypeReducers.create({
    name: params.name,
    displayNameI18nMap: params.displayNameI18nMap,
    descriptionI18nMap: params.descriptionI18nMap,
  });
  await params.badgeTypeRepository.createOne(badgeType);
};

/**
 * バッジの種類を更新する。
 * - この操作を行おうとしているユーザは、インスタンスの管理グループに所属している必要がある。
 * @throws 指定されたバッジの種類が存在しない場合、{@linkcode Exception}（`badgeType.notExists`）を投げる。
 */
export const update = async (
  params: {
    readonly name: BadgeTypeName;
    readonly displayNameI18nMap: I18nMap;
    readonly descriptionI18nMap: I18nMap;
  } & BadgeTypeServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  const badgeType = await params.badgeTypeRepository.getOneByName(params.name);
  if (badgeType === undefined) {
    throw Exception.create({ exceptionName: 'badgeType.notExists' });
  }

  const badgeTypeUpdated = BadgeTypeReducers.update(badgeType, {
    displayNameI18nMap: params.displayNameI18nMap,
    descriptionI18nMap: params.descriptionI18nMap,
  });
  await params.badgeTypeRepository.updateOne(badgeTypeUpdated);
};

/**
 * バッジの種類を削除する。
 * - この操作を行おうとしているユーザは、インスタンスの管理グループに所属している必要がある。
 */
export const deleteOne = async (
  params: { readonly name: BadgeTypeName } & BadgeTypeServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyInstanceAdmin({ userId: myUserAccount.id });

  await params.badgeTypeRepository.deleteOneByName(params.name);
};
//#endregion
