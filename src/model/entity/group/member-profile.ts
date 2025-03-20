import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyGroupMember,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { CertifiedUserProfile } from '../user/certified-user-profile.ts';
import type { Member } from './member.ts';
import type { GroupId } from './values.ts';

const memberProfileTypeSymbol = Symbol('memberProfile.type');

export type MemberProfile = {
  readonly [memberProfileTypeSymbol]: typeof memberProfileTypeSymbol;
} & Pick<CertifiedUserProfile, 'name' | 'displayName'> &
  Pick<Member, 'userId' | 'joinedAt' | 'roleInGroup'>;

export interface MemberProfileRepository {
  getMany(
    this: MemberProfileRepository,
    params: {
      readonly filters: Filters<MemberProfile> & { readonly groupId: GroupId };
      readonly orderBy: OrderBy<MemberProfile>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<MemberProfile>[] | readonly []>;

  count(
    this: MemberProfileRepository,
    params: { readonly filters: Filters<MemberProfile> & { readonly groupId: GroupId } },
  ): Promise<number>;
}

export interface MemberProfileServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    typeof verifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly memberProfileRepository: MemberProfileRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたグループのメンバーの一覧を取得する。
 * - この操作を行おうとするユーザは、グループのメンバーである必要がある。
 * @throws 指定されたグループが存在しない場合、{@linkcode Exception}（`group.notExists`）を投げる。
 */
export const getMany = async (
  params: {
    readonly groupId: GroupId;
    readonly filters?: Filters<MemberProfile>;
    readonly orderBy: OrderBy<MemberProfile>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & MemberProfileServiceDependencies,
): Promise<{ readonly members: readonly MemberProfile[] | readonly [] }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupMember({ groupId: params.groupId, userId: myUserAccount.id });

  const members = await params.memberProfileRepository.getMany({
    filters: { ...params.filters, groupId: params.groupId },
    orderBy: params.orderBy,
    limit: params.limit,
    offset: params.offset,
  });

  return { members };
};
