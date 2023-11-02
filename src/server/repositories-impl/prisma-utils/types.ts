import type { Prisma } from '../../prisma-client';
import type { DefaultArgs, GetResult, InternalArgs } from '../../prisma-client/runtime/library';

// #region TFindResult
type TPayload = {
  group: Prisma.$GroupPayload;
  groupMemberDirectory: Prisma.$GroupMemberDirectoryPayload;
  member: Prisma.$MemberPayload;
  groupProfile: Prisma.$GroupProfilePayload;
  badge: Prisma.$BadgePayload;
  permission: Prisma.$PermissionPayload;
  item: Prisma.$ItemPayload;
  itemBody: Prisma.$ItemBodyPayload;
  itemType: Prisma.$ItemTypePayload;
  authenticationToken: Prisma.$AuthenticationTokenPayload;
  emailVerification: Prisma.$EmailVerificationPayload;
  user: Prisma.$UserPayload;
  userProfile: Prisma.$UserProfilePayload;
  userShelf: Prisma.$UserShelfPayload;
  bookmark: Prisma.$BookmarkPayload;
};

type TClientMap<T, Null = never, ExtArgs extends InternalArgs = DefaultArgs> = {
  group: Prisma.Prisma__GroupClient<T, Null, ExtArgs>;
  groupMemberDirectory: Prisma.Prisma__GroupMemberDirectoryClient<T, Null, ExtArgs>;
  member: Prisma.Prisma__MemberClient<T, Null, ExtArgs>;
  groupProfile: Prisma.Prisma__GroupProfileClient<T, Null, ExtArgs>;
  badge: Prisma.Prisma__BadgeClient<T, Null, ExtArgs>;
  permission: Prisma.Prisma__PermissionClient<T, Null, ExtArgs>;
  item: Prisma.Prisma__ItemClient<T, Null, ExtArgs>;
  itemBody: Prisma.Prisma__ItemBodyClient<T, Null, ExtArgs>;
  itemType: Prisma.Prisma__ItemTypeClient<T, Null, ExtArgs>;
  authenticationToken: Prisma.Prisma__AuthenticationTokenClient<T, Null, ExtArgs>;
  emailVerification: Prisma.Prisma__EmailVerificationClient<T, Null, ExtArgs>;
  user: Prisma.Prisma__UserClient<T, Null, ExtArgs>;
  userProfile: Prisma.Prisma__UserProfileClient<T, Null, ExtArgs>;
  userShelf: Prisma.Prisma__UserShelfClient<T, Null, ExtArgs>;
  bookmark: Prisma.Prisma__BookmarkClient<T, Null, ExtArgs>;
};

declare const findUniqueFunc: <
  M extends keyof TPayload,
  A extends Prisma.SelectSubset<T, TFindUniqueArgs[M]>,
  T = TFindUniqueArgs[M],
>(
  model: M,
  args: A,
) => TClientMap<GetResult<TPayload[M], T, 'findUnique'> | null, null, DefaultArgs>[M];

/**
 * PrismaのFindの結果を表す型。
 * @typeParam M - 取得するテーブルを指定する。
 * @typeParam A - 取得方法を指定する。
 * @typeParam T - 取得方法を指定する。
 */
export type TFindResult<
  M extends keyof TPayload,
  A extends Prisma.SelectSubset<T, TFindUniqueArgs[M]>,
  T = TFindUniqueArgs[M],
> = NonNullable<Awaited<ReturnType<typeof findUniqueFunc<M, A, T>>>>;
// #endregion

/**
 * PrismaのfindUniqueの引数。
 */
export type TFindUniqueArgs = {
  group: Prisma.GroupFindUniqueArgs;
  groupMemberDirectory: Prisma.GroupMemberDirectoryFindUniqueArgs;
  member: Prisma.MemberFindUniqueArgs;
  groupProfile: Prisma.GroupProfileFindUniqueArgs;
  badge: Prisma.BadgeFindUniqueArgs;
  permission: Prisma.PermissionFindUniqueArgs;
  item: Prisma.ItemFindUniqueArgs;
  itemBody: Prisma.ItemBodyFindUniqueArgs;
  itemType: Prisma.ItemTypeFindUniqueArgs;
  authenticationToken: Prisma.AuthenticationTokenFindUniqueArgs;
  emailVerification: Prisma.EmailVerificationFindUniqueArgs;
  user: Prisma.UserFindUniqueArgs;
  userProfile: Prisma.UserProfileFindUniqueArgs;
  userShelf: Prisma.UserShelfFindUniqueArgs;
  bookmark: Prisma.BookmarkFindUniqueArgs;
};

export type TInclude = { [k in keyof TFindUniqueArgs]: TFindUniqueArgs[k]['include'] };

export type TWhereInput = { [k in keyof TFindUniqueArgs]: TFindUniqueArgs[k]['where'] };

/**
 * Prismaのupsertの引数。
 */
export type TUpsertArgs = {
  group: Prisma.GroupUpsertArgs;
  groupMemberDirectory: Prisma.GroupMemberDirectoryUpsertArgs;
  member: Prisma.MemberUpsertArgs;
  groupProfile: Prisma.GroupProfileUpsertArgs;
  badge: Prisma.BadgeUpsertArgs;
  permission: Prisma.PermissionUpsertArgs;
  item: Prisma.ItemUpsertArgs;
  itemBody: Prisma.ItemBodyUpsertArgs;
  itemType: Prisma.ItemTypeUpsertArgs;
  authenticationToken: Prisma.AuthenticationTokenUpsertArgs;
  emailVerification: Prisma.EmailVerificationUpsertArgs;
  user: Prisma.UserUpsertArgs;
  userProfile: Prisma.UserProfileUpsertArgs;
  userShelf: Prisma.UserShelfUpsertArgs;
  bookmark: Prisma.BookmarkUpsertArgs;
};

export type TCreateInput = { [k in keyof TUpsertArgs]: TUpsertArgs[k]['create'] };

export type TUpdateInput = { [k in keyof TUpsertArgs]: TUpsertArgs[k]['update'] };
