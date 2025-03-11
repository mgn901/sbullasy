import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextMap,
  ContextRepository,
  I18nMap,
  LogInUserClientContextMap,
  SystemConfigurationMap,
} from '../../lib/context.ts';
import type {
  EmailVerificationChallengeId,
  EmailVerificationChallengeVerificationCode,
  EmailVerificationServiceDependencies,
  answer,
  cancel,
  send,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { localize } from '../../lib/i18n.ts';
import { type Id, generateId } from '../../lib/random-values/id.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PickEssential, PreApplied } from '../../lib/type-utils.ts';
import type { EmailAddress } from '../../values.ts';
import type { UserId } from './values.ts';

//#region UserAccountConfigurationMap
export interface UserAccountConfigurationMap extends ContextMap {
  readonly 'userAccount.emailAddressUpdate.emailSubjectTemplate': I18nMap;
  readonly 'userAccount.emailAddressUpdate.emailBodyTemplate': I18nMap;
  readonly 'userAccount.emailAddressUpdate.expiredAfterMs': number;
}

const userAccountDefaultConfigurationMap = {
  'userAccount.emailAddressUpdate.emailSubjectTemplate': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete the email address change',
    ja: '【${system.displayName}】確認コードを確認・入力してメールアドレスの更新を完了してください',
  },
  'userAccount.emailAddressUpdate.emailBodyTemplate': {
    en: `You are about to changing the email address registered to the \${system.displayName} app.
Please enter the following verification code into the \${system.displayName} app to complete the email address update.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `\${system.displayName}に登録されているEメールアドレスを更新しようとしています。
更新を完了するには、\${system.displayName}の画面に確認コードを入力してください。

確認コード: \${emailVerification.verificationCode}

[!] 確認コードを他人と共有しないでください。

* このメールは\${system.displayName}のサーバから自動的に送信されています。このメールに返信することはできません。
* お心当たりのない場合は、このメールを破棄していただいてかまいません。
`,
  },
  'userAccount.emailAddressUpdate.expiredAfterMs': 5 * 60 * 1000,
} as const satisfies UserAccountConfigurationMap;
//#endregion

//#region UserAccount and UserAccountRepository
const userAccountTypeSymbol = Symbol('userAccount.type');

/**
 * ユーザアカウントを表す。
 */
export type UserAccount = {
  readonly [userAccountTypeSymbol]: typeof userAccountTypeSymbol;
  readonly id: UserId;
  readonly emailAddress: EmailAddress;
  readonly registeredAt: Date;
};

/**
 * {@linkcode UserAccount}の状態を変更するための関数を提供する。
 */
export const UserAccountReducers = {
  /**
   * 新しい{@linkcode UserAccount}を作成して返す。
   */
  create: <P extends { readonly emailAddress: TEmailAddress }, TEmailAddress extends EmailAddress>(
    params: PickEssential<P, keyof UserAccount>,
  ): UserAccount & Pick<P, 'emailAddress'> =>
    ({
      [userAccountTypeSymbol]: userAccountTypeSymbol,
      id: generateId() as UserId,
      emailAddress: params.emailAddress,
      registeredAt: new Date(),
    }) as const,

  /**
   * 指定されたユーザアカウントのEメールアドレスを、指定されたEメールアドレスに更新したものを返す。
   * @param self Eメールアドレスを更新するユーザアカウント
   */
  toEmailAddressUpdated: <
    S extends UserAccount,
    P extends { readonly newEmailAddress: TEmailAddress },
    TEmailAddress extends EmailAddress,
  >(
    self: S,
    params: P,
  ): S & { readonly emailAddress: TEmailAddress } =>
    ({ ...self, emailAddress: params.newEmailAddress }) as const,
} as const;

/**
 * {@linkcode UserAccount}を永続化するリポジトリ。
 */
export interface UserAccountRepository {
  getOneById<TId extends UserId>(
    this: UserAccountRepository,
    id: TId,
  ): Promise<FromRepository<UserAccount & { readonly id: TId }> | undefined>;

  getOneByEmailAddress<TEmailAddress extends EmailAddress>(
    this: UserAccountRepository,
    emailAddress: TEmailAddress,
  ): Promise<FromRepository<UserAccount & { readonly emailAddress: TEmailAddress }> | undefined>;

  getMany(
    this: UserAccountRepository,
    params: {
      readonly filters?: Filters<UserAccount>;
      readonly orderBy: OrderBy<UserAccount>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<UserAccount>[] | readonly []>;

  createOne(
    this: UserAccountRepository,
    userAccountOrUserAccountUpdateRequested: UserAccount,
  ): Promise<void>;

  updateOne(
    this: UserAccountRepository,
    userAccountOrUserAccountUpdateRequested: FromRepository<UserAccount>,
  ): Promise<void>;

  deleteOneById(this: UserAccountRepository, id: UserId): Promise<void>;
}
//#endregion

//#region UserAccountEmailAddressUpdateRequest and UserAccountEmailAddressUpdateRequestRepository
const userAccountEmailAddressUpdateRequestTypeSymbol = Symbol(
  'userAccountEmailAddressUpdateRequest.type',
);

export type UserAccountEmailAddressUpdateRequestId = NominalPrimitive<
  Id,
  typeof userAccountEmailAddressUpdateRequestTypeSymbol
>;

/**
 * ユーザアカウントのEメールアドレスの更新のリクエストを表す。
 */
export type UserAccountEmailAddressUpdateRequest = {
  readonly [userAccountEmailAddressUpdateRequestTypeSymbol]: typeof userAccountEmailAddressUpdateRequestTypeSymbol;
  readonly id: UserAccountEmailAddressUpdateRequestId;
  readonly userId: UserId;
  readonly newEmailAddress: EmailAddress;
  readonly status: 'requested' | 'completed' | 'canceled';
  readonly requestedAt: Date;
  readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
};

/**
 * {@linkcode UserAccountEmailAddressUpdateRequest}の状態を変更するための関数を提供する。
 */
export const UserAccountEmailAddressUpdateRequestReducers = {
  /**
   * 新しい{@linkcode UserAccountEmailAddressUpdateRequest}を作成して返す。
   */
  create: <
    P extends {
      readonly userId: TUserId;
      readonly newEmailAddress: TNewEmailAddress;
      readonly associatedEmailVerificationChallengeId: TAssociatedEmailVerificationChallengeId;
    },
    TUserId extends UserId,
    TNewEmailAddress extends EmailAddress,
    TAssociatedEmailVerificationChallengeId extends EmailVerificationChallengeId,
  >(
    params: PickEssential<P, keyof UserAccountEmailAddressUpdateRequest>,
  ): UserAccountEmailAddressUpdateRequest & { readonly status: 'requested' } & Pick<
      P,
      'userId' | 'newEmailAddress' | 'associatedEmailVerificationChallengeId'
    > =>
    ({
      [userAccountEmailAddressUpdateRequestTypeSymbol]:
        userAccountEmailAddressUpdateRequestTypeSymbol,
      id: generateId() as UserAccountEmailAddressUpdateRequestId,
      userId: params.userId,
      newEmailAddress: params.newEmailAddress,
      status: 'requested',
      requestedAt: new Date(),
      associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
    }) as const,

  /**
   * 指定されたリクエストを完了にして返す。
   * @param self 完了にするリクエスト
   */
  toCompleted: <S extends UserAccountEmailAddressUpdateRequest & { readonly status: 'requested' }>(
    self: S,
  ): S & { readonly status: 'completed' } => ({ ...self, status: 'completed' }) as const,

  /**
   * 指定されたリクエストを中止にして返す。
   * @param self 中止にするリクエスト
   */
  toCanceled: <S extends UserAccountEmailAddressUpdateRequest & { readonly status: 'requested' }>(
    self: S,
  ): S & { readonly status: 'canceled' } => ({ ...self, status: 'canceled' }) as const,

  isNotTerminated: <S extends UserAccountEmailAddressUpdateRequest>(
    self: S,
  ): self is S & { readonly status: Exclude<S['status'], 'completed' | 'canceled'> } =>
    self.status !== 'completed' && self.status !== 'canceled',
} as const;

export interface UserAccountEmailAddressUpdateRequestRepository {
  getOneById<TId extends UserAccountEmailAddressUpdateRequestId>(
    this: UserAccountEmailAddressUpdateRequestRepository,
    id: TId,
  ): Promise<
    FromRepository<UserAccountEmailAddressUpdateRequest & { readonly id: TId }> | undefined
  >;

  getMany(
    this: UserAccountEmailAddressUpdateRequestRepository,
    params: {
      readonly filters?: Filters<UserAccountEmailAddressUpdateRequest>;
      readonly orderBy: OrderBy<UserAccountEmailAddressUpdateRequest>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<UserAccountEmailAddressUpdateRequest>[] | readonly []>;

  createOne(
    this: UserAccountEmailAddressUpdateRequestRepository,
    userAccountEmailAddressUpdateRequest: UserAccountEmailAddressUpdateRequest,
  ): Promise<void>;

  updateOne(
    this: UserAccountEmailAddressUpdateRequestRepository,
    userAccountEmailAddressUpdateRequest: FromRepository<UserAccountEmailAddressUpdateRequest>,
  ): Promise<void>;

  deleteOneById(id: UserAccountEmailAddressUpdateRequestId): Promise<void>;
}
//#endregion

//#region UserAccountService
export interface UserAccountServiceDependencies {
  readonly sendEmailVerificationChallenge: PreApplied<
    typeof send,
    EmailVerificationServiceDependencies
  >;
  readonly answerEmailVerificationChallenge: PreApplied<
    typeof answer,
    EmailVerificationServiceDependencies
  >;
  readonly cancelEmailVerificationChallenge: PreApplied<
    typeof cancel,
    EmailVerificationServiceDependencies
  >;
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly userAccountRepository: UserAccountRepository;
  readonly userAccountEmailAddressUpdateRequestReposiory: UserAccountEmailAddressUpdateRequestRepository;
  readonly contextRepository: ContextRepository<
    UserAccountConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 自分自身の{@link UserAccount}を取得する。
 */
export const getMyUserAccount = async (
  params: UserAccountServiceDependencies,
): Promise<{ readonly userAccount: UserAccount }> => {
  return params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
};

/**
 * Eメールアドレスの更新を開始する。
 *
 * 更新後のEメールアドレスにEメールアドレス確認の確認コードを送信する。
 */
export const requestEmailAddressUpdate = async (
  params: { readonly newEmailAddress: EmailAddress } & UserAccountServiceDependencies,
): Promise<{
  readonly id: UserAccountEmailAddressUpdateRequestId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const acceptedLanguages = params.clientContextRepository.get('client.acceptedLanguages');

  const {
    id: associatedEmailVerificationChallengeId,
    sentAt,
    expiredAt,
  } = await params.sendEmailVerificationChallenge({
    emailAddress: params.newEmailAddress,
    emailSubjectTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('userAccount.emailAddressUpdate.emailSubjectTemplate'),
    }),
    emailBodyTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('userAccount.emailAddressUpdate.emailBodyTemplate'),
    }),
    valuesForTemplatePlaceholders: {
      'system.displayName': localize({
        acceptedLanguages,
        i18nMap: params.contextRepository.get('system.displayName'),
      }),
    },
    expiredAfterMs: params.contextRepository.get('userAccount.emailAddressUpdate.expiredAfterMs'),
  });

  const userAccountEmailAddressUpdateRequest = UserAccountEmailAddressUpdateRequestReducers.create({
    userId: userAccount.id,
    newEmailAddress: params.newEmailAddress,
    associatedEmailVerificationChallengeId,
  });
  await params.userAccountEmailAddressUpdateRequestReposiory.createOne(
    userAccountEmailAddressUpdateRequest,
  );

  return { id: userAccountEmailAddressUpdateRequest.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレスの更新を完了する。
 * @throws Eメールアドレスの更新のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userAccountEmailUpdate.notExists`）を投げる。
 * @throws 確認コードが正しくない場合は{@linkcode Exception}（`userAccount.verificationCodeIncorrect`）を投げる。
 */
export const completeEmailAddressUpdate = async (
  params: {
    readonly id: UserAccountEmailAddressUpdateRequestId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAccountServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const userAccountEmailAddressUpdateRequest =
    await params.userAccountEmailAddressUpdateRequestReposiory.getOneById(params.id);
  if (
    userAccountEmailAddressUpdateRequest === undefined ||
    !UserAccountEmailAddressUpdateRequestReducers.isNotTerminated(
      userAccountEmailAddressUpdateRequest,
    ) ||
    userAccountEmailAddressUpdateRequest.userId !== userAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userAccountEmailAddressUpdate.notExists' });
  }

  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: userAccountEmailAddressUpdateRequest.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({ exceptionName: 'userAccount.verificationCodeIncorrect' });
  }

  const userAccountEmailAddressUpdated = UserAccountReducers.toEmailAddressUpdated(userAccount, {
    newEmailAddress: userAccountEmailAddressUpdateRequest.newEmailAddress,
  });
  await params.userAccountRepository.updateOne(userAccountEmailAddressUpdated);

  const userAccountEmailAddressUpdateRequestCompleted =
    UserAccountEmailAddressUpdateRequestReducers.toCompleted(userAccountEmailAddressUpdateRequest);
  await params.userAccountEmailAddressUpdateRequestReposiory.updateOne(
    userAccountEmailAddressUpdateRequestCompleted,
  );
};

/**
 * Eメールアドレスの変更を中止する。
 * @throws Eメールアドレスの更新のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userAccountEmailUpdate.notExists`）を投げる。
 */
export const cancelEmailAddressUpdate = async (
  params: { readonly id: UserAccountEmailAddressUpdateRequestId } & UserAccountServiceDependencies,
) => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const userAccountEmailAddressUpdateRequest =
    await params.userAccountEmailAddressUpdateRequestReposiory.getOneById(params.id);
  if (
    userAccountEmailAddressUpdateRequest === undefined ||
    !UserAccountEmailAddressUpdateRequestReducers.isNotTerminated(
      userAccountEmailAddressUpdateRequest,
    ) ||
    userAccountEmailAddressUpdateRequest.userId !== userAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userAccountEmailAddressUpdate.notExists' });
  }

  await params.cancelEmailVerificationChallenge({
    id: userAccountEmailAddressUpdateRequest.associatedEmailVerificationChallengeId,
  });

  const userAccountEmailAddressUpdateRequestCanceled =
    UserAccountEmailAddressUpdateRequestReducers.toCanceled(userAccountEmailAddressUpdateRequest);
  await params.userAccountEmailAddressUpdateRequestReposiory.updateOne(
    userAccountEmailAddressUpdateRequestCanceled,
  );
};

/**
 * 自分自身のユーザアカウントを削除する。
 */
export const deleteMyUserAccount = async (
  params: UserAccountServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  params.userAccountRepository.deleteOneById(userAccount.id);
};
//#endregion
