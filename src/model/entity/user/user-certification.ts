import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type {
  PreAppliedVerifyAccessToken,
  PreAppliedVerifyCertifiedUser,
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
  AnswerEmailVerificationChallenge,
  CancelEmailVerificationChallenge,
  EmailVerificationChallengeId,
  EmailVerificationChallengeVerificationCode,
  SendEmailVerificationChallenge,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { localize } from '../../lib/i18n.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import type { DeleteOneBy, GetOneBy, Repository } from '../../lib/repository.ts';
import type { EmailAddress } from '../../values.ts';
import type { UserId } from './user-account.ts';

//#region CertifiedUserProfileConfigurationMap
export interface UserCertificationConfigurationMap extends ContextMap {
  readonly 'userCertification.expiredAt': number;
  readonly 'userCertificationRequest.acceptedEmailAddressRegExp': string;
  readonly 'userCertificationRequest.acceptedEmailAddressDescription': I18nMap;
  readonly 'userCertificationRequest.recertificatableBeforeMs': number;
  readonly 'userCertificationRequest.emailSubjectTemplate': I18nMap;
  readonly 'userCertificationRequest.emailBodyTemplate': I18nMap;
  readonly 'userCertificationRequest.expiredAfterMs': number;
}

const userCertificationDefaultConfigurationMap = {
  'userCertificationRequest.acceptedEmailAddressRegExp': '^[a-z0-9]{5,8}@example.edu$',
  'userCertificationRequest.acceptedEmailAddressDescription': {
    en: 'Only the email address of Example University (ending with `@example.edu`) will be accepted.',
    ja: 'エグザンプル大学の大学メールアドレス（`@example.edu`で終わるもの）のみ入力することができます。',
  },
  'userCertification.expiredAt': Date.parse('2026-03-31T23:59:59.999+09:00'),
  'userCertificationRequest.recertificatableBeforeMs': 30 * 24 * 60 * 60 * 1000,
  'userCertificationRequest.emailSubjectTemplate': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete student certification',
    ja: '【${system.displayName}】確認コードを確認・入力して学生証明を完了してください',
  },
  'userCertificationRequest.emailBodyTemplate': {
    en: `You are about to get your \${system.displayName} user account certified as a student.
Please enter the following verification code into the \${system.displayName} app to complete certification process.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `\${system.displayName}の学生認証をしようとしています。
学生証明を完了するには、\${system.displayName}の画面に確認コードを入力してください。

確認コード: \${emailVerification.verificationCode}

[!] 確認コードを他人と共有しないでください。

* このメールは\${system.displayName}のサーバから自動的に送信されています。このメールに返信することはできません。
* お心当たりのない場合は、このメールを破棄していただいてかまいません。
`,
  },
  'userCertificationRequest.expiredAfterMs': 5 * 60 * 1000,
} as const satisfies UserCertificationConfigurationMap;
//#endregion

//#region UserCertification
export const userCertificationIdSymbol = Symbol('userCeritification.id');
export type UserCertificationId = NominalPrimitive<Id, typeof userCertificationIdSymbol>;

/**
 * Eメールアドレス確認によって特定の身分をもつことが確認されたことの証明書を表す。
 *
 * - 証明書は、ユーザが証明を完了させたときに作成される。
 * - 証明書は、証明書の有効期限が切れるか、{@linkcode UserCertificationRevokedEvent}で無効化されるまで有効である。
 */
export type UserCertification = ReturnType<typeof newUserCertificationFrom>;

export const newUserCertificationFrom = <P extends { certifiedUserId: UserId; expiredAt: Date }>(
  params: Readonly<P>,
) =>
  ({
    type: 'userCertification',
    id: generateId() as UserCertificationId,
    certifiedUserId: params.certifiedUserId,
    certifiedAt: new Date(),
    expiredAt: params.expiredAt,
  }) as const;

export type UserCertificationRepository = Repository<UserCertification> & {
  readonly getOneById: GetOneBy<UserCertification, UserCertificationId, 'id'>;
  readonly deleteOneById: DeleteOneBy<UserCertificationId>;
};
//#endregion

//#region RevokedUserCertification
export type RevokedUserCertification = ReturnType<typeof newRevokedUserCertificationFrom>;

export const newRevokedUserCertificationFrom = <P extends UserCertification>(params: Readonly<P>) =>
  ({
    type: 'revokedUserCertification',
    id: params.id,
    certifiedUserId: params.certifiedUserId,
    certifiedAt: params.certifiedAt,
    revokedAt: new Date(),
  }) as const;

export type RevokedUserCertificationRepository = Repository<RevokedUserCertification> & {
  readonly getOneById: GetOneBy<RevokedUserCertification, UserCertificationId, 'id'>;
  readonly deleteOneById: DeleteOneBy<UserCertificationId>;
};
//#endregion

//#region UserCertificationRequest
export const userCertificationRequestIdSymbol = Symbol('userCertificationRequest.id');
export type UserCertificationRequestId = NominalPrimitive<
  Id,
  typeof userCertificationRequestIdSymbol
>;

/**
 * 証明書のリクエストを表す。
 */
export type UserCertificationRequest = ReturnType<typeof newUserCertificationRequestFrom>;

export const newUserCertificationRequestFrom = <
  P extends {
    certifiedUserId: UserId;
    certificationExpiredAt: Date;
    associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userCertificationRequest',
    id: generateId() as UserCertificationRequestId,
    certifiedUserId: params.certifiedUserId,
    certificationExpiredAt: params.certificationExpiredAt,
    requestedAt: new Date(),
    associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
  }) as const;

export type UserCertificationRequestRepository = Repository<UserCertificationRequest> & {
  readonly getOneById: GetOneBy<UserCertificationRequest, UserCertificationRequestId, 'id'>;
  readonly deleteOneById: DeleteOneBy<UserCertificationRequestId>;
};
//#endregion

//#region UserCertificationRequestCompletedEvent
export type UserCertificationRequestCompletedEvent = ReturnType<
  typeof newUserCertificationRequestCompletedEventFrom
>;

export const newUserCertificationRequestCompletedEventFrom = <
  P extends {
    userCertificationRequestId: UserCertificationRequestId;
    userCertificationId: UserCertificationId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userCertificationRequest.completed',
    userCertificationRequestId: params.userCertificationRequestId,
    userCertificationId: params.userCertificationId,
    completedAt: new Date(),
  }) as const;

export type UserCertificationRequestCompletedEventRepository =
  Repository<UserCertificationRequestCompletedEvent> & {
    readonly getOneById: GetOneBy<
      UserCertificationRequestCompletedEvent,
      UserCertificationRequestId,
      'userCertificationRequestId'
    >;
    readonly deleteOneById: DeleteOneBy<UserCertificationRequestId>;
  };
//#endregion

//#region UserCertificationRequestCanceledEvent
export type UserCertificationRequestCanceledEvent = ReturnType<
  typeof newUserCertificationRequestCanceledEventFrom
>;

export const newUserCertificationRequestCanceledEventFrom = <
  P extends { userCertificationRequestId: UserCertificationRequestId },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'userCertificationRequest.canceled',
    userCertificationRequestId: params.userCertificationRequestId,
    canceledAt: new Date(),
  }) as const;

export type UserCertificationRequestCanceledEventRepository =
  Repository<UserCertificationRequestCanceledEvent> & {
    readonly getOneById: GetOneBy<
      UserCertificationRequestCanceledEvent,
      UserCertificationRequestId,
      'userCertificationRequestId'
    >;
    readonly deleteOneById: DeleteOneBy<UserCertificationRequestId>;
  };
//#endregion

export interface CertifiedUserProfileServiceDependencies {
  readonly verifyAccessToken: PreAppliedVerifyAccessToken;
  readonly verifyCertifiedUser: PreAppliedVerifyCertifiedUser;
  readonly sendEmailVerificationChallenge: SendEmailVerificationChallenge;
  readonly answerEmailVerificationChallenge: AnswerEmailVerificationChallenge;
  readonly cancelEmailVerificationChallenge: CancelEmailVerificationChallenge;
  readonly userCertificationRepository: UserCertificationRepository;
  readonly revokedUserCertificationRepository: RevokedUserCertificationRepository;
  readonly userCertificationRequestRepository: UserCertificationRequestRepository;
  readonly userCertificationRequestCompletedEventRepository: UserCertificationRequestCompletedEventRepository;
  readonly userCertificationRequestCanceledEventRepository: UserCertificationRequestCanceledEventRepository;
  readonly contextRepository: ContextRepository<
    UserCertificationConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 認証済みユーザプロフィールの作成を開始する。
 * - アクセストークンが必要である。
 * - 入力されたEメールアドレスにEメールアドレス確認の確認コードを送信する。
 * @throws 認証済みユーザプロフィールが作成済みで、有効期限より一定期間以上前の場合は、{@linkcode Exception}（`userCertification.alreadyCertified`）を投げる。
 * @throws 入力されたEメールアドレスが認証済みユーザの要件を満たさない場合は、{@linkcode Exception}（`userCertification.emailAddressRejected`）を投げる。
 */
export const requestUserCertification = async (
  params: { readonly emailAddress: EmailAddress } & CertifiedUserProfileServiceDependencies,
): Promise<{
  readonly id: UserCertificationRequestId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const now = new Date();

  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const [newestNonexpiredCertification] = await params.userCertificationRepository.getMany({
    filters: { expiredAt: ['gt', now], certifiedUserId: myUserAccount.id },
    orderBy: { certifiedAt: 'desc' },
    limit: 1,
  });
  if (
    newestNonexpiredCertification !== undefined &&
    now.getTime() <
      newestNonexpiredCertification.expiredAt.getTime() -
        params.contextRepository.get('userCertificationRequest.recertificatableBeforeMs')
  ) {
    throw Exception.create({ exceptionName: 'userCertification.alreadyCertified' });
  }

  if (
    new RegExp(
      params.contextRepository.get('userCertificationRequest.acceptedEmailAddressRegExp'),
    ).test(params.emailAddress) === false
  ) {
    throw Exception.create({ exceptionName: 'userCertification.emailAddressRejected' });
  }

  const acceptedLanguages = params.clientContextRepository.get('client.acceptedLanguages');

  const {
    id: associatedEmailVerificationChallengeId,
    sentAt,
    expiredAt,
  } = await params.sendEmailVerificationChallenge({
    emailAddress: params.emailAddress,
    emailSubjectTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('userCertificationRequest.emailSubjectTemplate'),
    }),
    emailBodyTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('userCertificationRequest.emailBodyTemplate'),
    }),
    valuesForTemplatePlaceholders: {
      'system.displayName': localize({
        acceptedLanguages,
        i18nMap: params.contextRepository.get('system.displayName'),
      }),
    },
    expiredAfterMs: params.contextRepository.get('userCertificationRequest.expiredAfterMs'),
  });

  const request = newUserCertificationRequestFrom({
    certifiedUserId: myUserAccount.id,
    certificationExpiredAt: new Date(params.contextRepository.get('userCertification.expiredAt')),
    associatedEmailVerificationChallengeId,
  });
  await params.userCertificationRequestRepository.createOne(request);

  return { id: request.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、認証済みユーザプロフィールの作成を完了する。
 * - アクセストークンが必要である。
 * @throws 認証済みユーザプロフィールの作成のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userCertification.notExists`）を投げる。
 * @throws 確認コードが正しくない場合は{@linkcode Exception}（`userCertification.verificationCodeIncorrect`）を投げる。
 */
export const completeUserCertification = async (
  params: {
    readonly id: UserCertificationRequestId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & CertifiedUserProfileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const request = await params.userCertificationRequestRepository.getOneById(params.id);
  const isCompleted =
    (await params.userCertificationRequestCompletedEventRepository.getOneById(params.id)) ?? false;
  const isCanceled =
    (await params.userCertificationRequestCanceledEventRepository.getOneById(params.id)) ?? false;
  if (
    request === undefined ||
    isCompleted ||
    isCanceled ||
    request.certifiedUserId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userCertification.notExists' });
  }

  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: request.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({
      exceptionName: 'userCertification.verificationCodeIncorrect',
    });
  }

  const now = new Date();
  const [newestNonexpiredCertification] = await params.userCertificationRepository.getMany({
    filters: { expiredAt: ['gt', now], certifiedUserId: myUserAccount.id },
    orderBy: { certifiedAt: 'desc' },
    limit: 1,
  });
  if (newestNonexpiredCertification !== undefined) {
    await params.revokedUserCertificationRepository.createOne(
      newRevokedUserCertificationFrom(newestNonexpiredCertification),
    );
    await params.userCertificationRepository.deleteOneById(newestNonexpiredCertification.id);
  }
  const newUserCertification = newUserCertificationFrom({
    certifiedUserId: myUserAccount.id,
    expiredAt: request.certificationExpiredAt,
  });
  await params.userCertificationRepository.createOne(newUserCertification);
  await params.userCertificationRequestCompletedEventRepository.createOne(
    newUserCertificationRequestCompletedEventFrom({
      userCertificationRequestId: request.id,
      userCertificationId: newUserCertification.id,
    }),
  );
};

/**
 * 認証済みユーザプロフィールの作成を中止する。
 * - アクセストークンが必要である。
 * @throws 認証済みユーザプロフィールの作成のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userCertification.notExists`）を投げる。
 */
export const cancelUserCertification = async (
  params: { readonly id: UserCertificationRequestId } & CertifiedUserProfileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const request = await params.userCertificationRequestRepository.getOneById(params.id);

  const isCompleted =
    (await params.userCertificationRequestCompletedEventRepository.getOneById(params.id)) ?? false;
  const isCanceled =
    (await params.userCertificationRequestCanceledEventRepository.getOneById(params.id)) ?? false;
  if (
    request === undefined ||
    isCompleted ||
    isCanceled ||
    request.certifiedUserId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userCertification.notExists' });
  }

  await params.cancelEmailVerificationChallenge({
    id: request.associatedEmailVerificationChallengeId,
  });
  await params.userCertificationRequestCanceledEventRepository.createOne(
    newUserCertificationRequestCanceledEventFrom({ userCertificationRequestId: request.id }),
  );
};
