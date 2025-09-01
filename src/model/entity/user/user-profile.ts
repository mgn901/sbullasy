import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import type {
  AnswerEmailVerificationChallenge,
  SendEmailVerificationChallenge,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import type { DeleteOneBy, GetOneBy, MutableRepository } from '../../lib/repository.ts';
import type { DisplayName, Name } from '../../values.ts';
import type { UserId } from './values.ts';

//#region UserProfile

/**
 * ユーザのプロフィールを表す。
 */
export type UserProfile = ReturnType<typeof newUserProfileFrom>;

export const newUserProfileFrom = <
  P extends { userId: UserId; name: Name; displayName: DisplayName },
>(
  params: Readonly<P>,
) =>
  ({
    userId: params.userId,
    name: params.name,
    displayName: params.displayName,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as const;

export type UserProfileRepository = MutableRepository<UserProfile> & {
  readonly getOneById: GetOneBy<UserProfile, UserId, 'userId'>;
  readonly deleteOneById: DeleteOneBy<UserId>;
};
//#endregion

//#region UserProfileService
export interface UserProfileServiceDependencies {
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
  readonly sendEmailVerificationChallenge: SendEmailVerificationChallenge;
  readonly answerEmailVerificationChallenge: AnswerEmailVerificationChallenge;
  readonly userProfileRepository: UserProfileRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 自分のユーザプロフィールを取得する。
 * @throws 自分のユーザプロフィールが存在しない場合は、{@linkcode Exception}（`userProfile.notExists`）を投げる。
 */
export const getMyUserProfile = async (
  params: UserProfileServiceDependencies,
): Promise<{ readonly userProfile: UserProfile }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const userProfile = await params.userProfileRepository.getOneById(myUserAccount.id);
  if (userProfile === undefined) {
    throw Exception.create({ exceptionName: 'userProfile.notExists' });
  }

  return { userProfile };
};

/**
 * 自分のユーザプロフィールの名前と表示名を更新する。
 */
export const editMyCertifiedUserProfile = async (
  params: {
    readonly name: Name;
    readonly displayName: DisplayName;
  } & UserProfileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const myUserProfile = await params.userProfileRepository.getOneById(myUserAccount.id);
  if (myUserProfile === undefined) {
    throw Exception.create({ exceptionName: 'userProfile.notExists' });
  }

  await params.userProfileRepository.updateOne({
    ...myUserProfile,
    name: params.name,
    displayName: params.displayName,
    updatedAt: new Date(),
  });
};
//#endregion
