import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type { ContextRepository, LogInUserClientContextMap } from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import type { DeleteOneBy, GetOneBy, Repository } from '../../lib/repository.ts';
import type { BookmarkRepository } from '../bookmark/bookmark.ts';
import type { MembershipRepository } from './membership.ts';
import type { UserAccount, UserAccountRepository, UserId } from './user-account.ts';
import type { UserProfileRepository } from './user-profile.ts';

//#region DeletedUserAccount
export type DeletedUserAccount = ReturnType<typeof newDeletedUserAccountFrom>;

export const newDeletedUserAccountFrom = <P extends UserAccount>(params: Readonly<P>) =>
  ({
    type: 'userAccount.deleted',
    userId: params.id,
    emailAddress: params.emailAddress,
    registeredAt: params.registeredAt,
    deletedAt: new Date(),
  }) as const;

export type DeletedUserAccountRepository = Repository<DeletedUserAccount> & {
  readonly getOneById: GetOneBy<DeletedUserAccount, UserId, 'userId'>;
  readonly deleteOneById: DeleteOneBy<UserId>;
};
//#endregion

export type UserAccountLifecycleServiceDependencies = {
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
  readonly userAccountRepository: UserAccountRepository;
  readonly deletedUserAccountRepository: DeletedUserAccountRepository;
  readonly bookmarkRepository: BookmarkRepository;
  readonly userProfileRepository: UserProfileRepository;
  readonly membershipRepository: MembershipRepository;
  readonly clientContextRepository: ContextRepository<LogInUserClientContextMap>;
};

/**
 * 自分自身のユーザアカウントを削除する。
 * - 有効なアクセストークンが必要である。
 * - 自分のプロフィール、ブックマークも削除する。
 * @throws グループに1つ以上所属している場合は、{@linkcode Exception}（`userCertification.notLeftAllGroupsYet`）を投げる。
 */
export const deleteMyUserAccount = async (
  params: UserAccountLifecycleServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const membershipCount = await params.membershipRepository.count({
    filters: { userId: myUserAccount.id },
  });
  if (membershipCount > 0) {
    throw Exception.create({ exceptionName: 'userCertification.notLeftAllGroupsYet' });
  }

  await params.userProfileRepository.deleteOneById(myUserAccount.id);
  await params.bookmarkRepository.deleteMany({ filters: { bookmarkedBy: myUserAccount.id } });
  await params.deletedUserAccountRepository.createOne(newDeletedUserAccountFrom(myUserAccount));
  await params.userAccountRepository.deleteOneById(myUserAccount.id);
};
