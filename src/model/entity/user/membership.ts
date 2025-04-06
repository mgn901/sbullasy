import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { GroupProfile } from '../group/group.ts';
import type { Member } from '../group/member.ts';
import type { GroupId } from '../group/values.ts';
import type { UserId } from './values.ts';

const membershipTypeSymbol = Symbol('membership.type');

export type Membership = {
  readonly [membershipTypeSymbol]: typeof membershipTypeSymbol;
  readonly groupId: GroupId;
} & Pick<GroupProfile, 'name' | 'displayName' | 'iconFileId' | 'roleInInstance' | 'badges'> &
  Pick<Member, 'groupId' | 'joinedAt' | 'roleInGroup'>;

export interface MembershipRepository {
  getMany(
    this: MembershipRepository,
    params: {
      readonly filters: Filters<Membership> & { readonly userId: UserId };
      readonly orderBy: OrderBy<Membership>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<Membership>[] | readonly []>;

  count(
    this: MembershipRepository,
    params: { filters: Filters<Membership> & { readonly userId: UserId } },
  ): Promise<number>;
}

export interface MembershipServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly membershipRepository: MembershipRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 自分が所属するグループの一覧を取得する。
 */
export const getMyMemberships = async (
  params: {
    readonly filters?: Filters<Membership>;
    readonly orderBy: OrderBy<Membership>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & MembershipServiceDependencies,
): Promise<{ readonly groups: readonly Membership[] | readonly [] }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const groups = await params.membershipRepository.getMany({
    filters: { userId: myUserAccount.id },
    orderBy: params.orderBy,
    limit: params.limit,
    offset: params.offset,
  });

  return { groups };
};
