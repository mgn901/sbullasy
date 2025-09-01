import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { PreAppliedVerifyAccessToken } from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextMap,
  ContextRepository,
  I18nMap,
  LogInUserClientContextMap,
  SystemConfigurationMap,
} from '../../lib/context.ts';
import type {
  AnswerEmailVerificationChallenge,
  CancelEmailVerificationChallenge,
  EmailVerificationChallengeId,
  EmailVerificationChallengeVerificationCode,
  SendEmailVerificationChallenge,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { localize } from '../../lib/i18n.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import type { DeleteOneBy, GetOneBy, MutableRepository, Repository } from '../../lib/repository.ts';
import type { EmailAddress } from '../../values.ts';

//#region UserAccountConfigurationMap
export interface UserAccountConfigurationMap extends ContextMap {
  readonly 'userAccount.emailAddressUpdate.emailSubjectTemplate': I18nMap;
  readonly 'userAccount.emailAddressUpdate.emailBodyTemplate': I18nMap;
  readonly 'userAccount.emailAddressUpdate.expiredAfterMs': number;
}

const userAccountDefaultConfigurationMap = {
  'userAccount.emailAddressUpdate.emailSubjectTemplate': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete the email address change',
    ja: '【${system.displayName}】確認コードを確認・入力してEメールアドレスの更新を完了してください',
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

//#region UserAccount
export const userIdSymbol = Symbol('user.id');
export type UserId = NominalPrimitive<Id, typeof userIdSymbol>;

/**
 * アプリケーションを利用するユーザと紐付けられるユーザアカウントを表す。
 * - ユーザアカウントはIDとEメールアドレスによって一意に識別される。
 * - Eメールアドレスは、Eメールアドレス確認による認証に用いられる。また、認証を済ませたユーザはEメールアドレスを変更することもできる。
 */
export type UserAccount = ReturnType<typeof newUserAccountFrom>;

export const newUserAccountFrom = <P extends { emailAddress: EmailAddress }>(params: Readonly<P>) =>
  ({
    type: 'userAccount',
    id: generateId() as UserId,
    emailAddress: params.emailAddress,
    registeredAt: new Date(),
  }) as const;

export type UserAccountRepository = MutableRepository<UserAccount> & {
  readonly getOneById: GetOneBy<UserAccount, UserId, 'id'>;
  readonly deleteOneById: DeleteOneBy<UserId>;
  readonly getOneByEmailAddress: GetOneBy<UserAccount, EmailAddress, 'emailAddress'>;
};
//#endregion

//#region UserAccountEmailAddressUpdateRequest
export const userAccountEmailAddressUpdateRequestIdSymbol = Symbol(
  'userAccountEmailAddressUpdateRequest.id',
);
export type UserAccountEmailAddressUpdateRequestId = NominalPrimitive<
  Id,
  typeof userAccountEmailAddressUpdateRequestIdSymbol
>;

/**
 * ユーザアカウントのEメールアドレスの更新のリクエストを表す。
 */
export type UserAccountEmailAddressUpdateRequest = ReturnType<
  typeof newUserAccountEmailAddressUpdateRequestFrom
>;

export const newUserAccountEmailAddressUpdateRequestFrom = <
  P extends {
    userId: UserId;
    originalEmailAddress: EmailAddress;
    newEmailAddress: EmailAddress;
    associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userAccountEmailAddressUpdateRequest',
    id: generateId() as UserAccountEmailAddressUpdateRequestId,
    userId: params.userId,
    originalEmailAddress: params.originalEmailAddress,
    newEmailAddress: params.newEmailAddress,
    requestedAt: new Date(),
    associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
  }) as const;

export type UserAccountEmailAddressUpdateRequestRepository =
  Repository<UserAccountEmailAddressUpdateRequest> & {
    readonly getOneById: GetOneBy<
      UserAccountEmailAddressUpdateRequest,
      UserAccountEmailAddressUpdateRequestId,
      'id'
    >;
    readonly deleteOneById: DeleteOneBy<UserAccountEmailAddressUpdateRequestId>;
  };
//#endregion

//#region UserAccountEmailAddressUpdateRequestCompletedEvent
export type UserAccountEmailAddressUpdateRequestCompletedEvent = ReturnType<
  typeof newUserAccountEmailAddressUpdateRequestCompletedEventFrom
>;

export const newUserAccountEmailAddressUpdateRequestCompletedEventFrom = <
  P extends { userAccountEmailAddressUpdateRequestId: UserAccountEmailAddressUpdateRequestId },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userAccountEmailAddressUpdateRequest.completed',
    userAccountEmailAddressUpdateRequestId: params.userAccountEmailAddressUpdateRequestId,
    completedAt: new Date(),
  }) as const;

export type UserAccountEmailAddressUpdateRequestCompletedEventRepository =
  Repository<UserAccountEmailAddressUpdateRequestCompletedEvent> & {
    readonly getOneById: GetOneBy<
      UserAccountEmailAddressUpdateRequestCompletedEvent,
      UserAccountEmailAddressUpdateRequestId,
      'userAccountEmailAddressUpdateRequestId'
    >;
    readonly deleteOneById: DeleteOneBy<UserAccountEmailAddressUpdateRequestId>;
  };
//#endregion

//#region UserAccountEmailAddressUpdateRequestCanceledEvent
export type UserAccountEmailAddressUpdateRequestCanceledEvent = ReturnType<
  typeof newUserAccountEmailAddressUpdateRequestCanceledEventFrom
>;

export const newUserAccountEmailAddressUpdateRequestCanceledEventFrom = <
  P extends { userAccountEmailAddressUpdateRequestId: UserAccountEmailAddressUpdateRequestId },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userAccountEmailAddressUpdateRequest.canceled',
    userAccountEmailAddressUpdateRequestId: params.userAccountEmailAddressUpdateRequestId,
    canceledAt: new Date(),
  }) as const;

export type UserAccountEmailAddressUpdateRequestCanceledEventRepository =
  Repository<UserAccountEmailAddressUpdateRequestCanceledEvent> & {
    readonly getOneById: GetOneBy<
      UserAccountEmailAddressUpdateRequestCanceledEvent,
      UserAccountEmailAddressUpdateRequestId,
      'userAccountEmailAddressUpdateRequestId'
    >;
    readonly deleteOneById: DeleteOneBy<UserAccountEmailAddressUpdateRequestId>;
  };
//#endregion

//#region UserAccountService
export type UserAccountServiceDependencies = {
  readonly sendEmailVerificationChallenge: SendEmailVerificationChallenge;
  readonly answerEmailVerificationChallenge: AnswerEmailVerificationChallenge;
  readonly cancelEmailVerificationChallenge: CancelEmailVerificationChallenge;
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
  readonly userAccountRepository: UserAccountRepository;
  readonly userAccountEmailAddressUpdateRequestReposiory: UserAccountEmailAddressUpdateRequestRepository;
  readonly userAccountEmailAddressUpdateRequestCompletedEventReposiory: UserAccountEmailAddressUpdateRequestCompletedEventRepository;
  readonly userAccountEmailAddressUpdateRequestCanceledEventReposiory: UserAccountEmailAddressUpdateRequestCanceledEventRepository;
  readonly contextRepository: ContextRepository<
    UserAccountConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
};

/**
 * 自分自身の{@link UserAccount}を取得する。
 */
export const getMyUserAccount = async (
  params: UserAccountServiceDependencies,
): Promise<{ readonly userAccount: UserAccount }> => {
  return {
    userAccount: (
      await params.verifyAccessToken({
        accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
      })
    ).myUserAccount,
  };
};

/**
 * Eメールアドレスの更新を開始する。
 * - 有効なアクセストークンが必要である。
 * - 更新後のEメールアドレスにEメールアドレス確認の確認コードを送信する。
 */
export const requestMyUserAccountEmailAddressUpdate = async (
  params: { readonly newEmailAddress: EmailAddress } & UserAccountServiceDependencies,
): Promise<{
  readonly id: UserAccountEmailAddressUpdateRequestId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const { myUserAccount } = await params.verifyAccessToken({
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

  const userAccountEmailAddressUpdateRequest = newUserAccountEmailAddressUpdateRequestFrom({
    userId: myUserAccount.id,
    originalEmailAddress: myUserAccount.emailAddress,
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
 * - 有効なアクセストークンが必要である。
 * @throws Eメールアドレスの更新のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userAccountEmailAddressUpdate.notExists`）を投げる。
 * @throws 確認コードが正しくない場合は{@linkcode Exception}（`userAccountEmailAddressUpdate.verificationCodeIncorrect`）を投げる。
 */
export const completeMyUserAccountEmailAddressUpdate = async (
  params: {
    readonly id: UserAccountEmailAddressUpdateRequestId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAccountServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const userAccountEmailAddressUpdateRequest =
    await params.userAccountEmailAddressUpdateRequestReposiory.getOneById(params.id);
  const isCompleted =
    (await params.userAccountEmailAddressUpdateRequestCompletedEventReposiory.getOneById(
      params.id,
    )) ?? false;
  const isCanceled =
    (await params.userAccountEmailAddressUpdateRequestCanceledEventReposiory.getOneById(
      params.id,
    )) ?? false;
  if (
    userAccountEmailAddressUpdateRequest === undefined ||
    isCompleted ||
    isCanceled ||
    userAccountEmailAddressUpdateRequest.userId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userAccountEmailAddressUpdate.notExists' });
  }

  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: userAccountEmailAddressUpdateRequest.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({
      exceptionName: 'userAccountEmailAddressUpdate.verificationCodeIncorrect',
    });
  }

  await params.userAccountRepository.updateOne({
    ...myUserAccount,
    emailAddress: userAccountEmailAddressUpdateRequest.newEmailAddress,
  });
  await params.userAccountEmailAddressUpdateRequestCompletedEventReposiory.createOne(
    newUserAccountEmailAddressUpdateRequestCompletedEventFrom({
      userAccountEmailAddressUpdateRequestId: userAccountEmailAddressUpdateRequest.id,
    }),
  );
};

/**
 * Eメールアドレスの更新を中止する。
 * - 有効なアクセストークンが必要である。
 * @throws Eメールアドレスの更新のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userAccountEmailAddressUpdate.notExists`）を投げる。
 */
export const cancelMyUserAccountEmailAddressUpdate = async (
  params: { readonly id: UserAccountEmailAddressUpdateRequestId } & UserAccountServiceDependencies,
) => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const userAccountEmailAddressUpdateRequest =
    await params.userAccountEmailAddressUpdateRequestReposiory.getOneById(params.id);
  const isCompleted =
    (await params.userAccountEmailAddressUpdateRequestCompletedEventReposiory.getOneById(
      params.id,
    )) ?? false;
  const isCanceled =
    (await params.userAccountEmailAddressUpdateRequestCanceledEventReposiory.getOneById(
      params.id,
    )) ?? false;
  if (
    userAccountEmailAddressUpdateRequest === undefined ||
    isCompleted ||
    isCanceled ||
    userAccountEmailAddressUpdateRequest.userId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userAccountEmailAddressUpdate.notExists' });
  }

  await params.cancelEmailVerificationChallenge({
    id: userAccountEmailAddressUpdateRequest.associatedEmailVerificationChallengeId,
  });

  await params.userAccountEmailAddressUpdateRequestCanceledEventReposiory.createOne(
    newUserAccountEmailAddressUpdateRequestCanceledEventFrom({
      userAccountEmailAddressUpdateRequestId: userAccountEmailAddressUpdateRequest.id,
    }),
  );
};
//#endregion
