import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { FromRepository } from '@mgn901/mgn901-utils-ts/repository-utils';
import {
  calculateNextExecutionDate,
  type TimeWindowRateLimitationRule,
} from '@mgn901/mgn901-utils-ts/time-window-rate-limitation';
import type {
  ClientContextMap,
  ContextMap,
  ContextRepository,
  I18nMap,
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
import type { Repository } from '../../lib/repository.ts';
import type { EmailAddress } from '../../values.ts';
import {
  type AccessTokenConfigurationMap,
  AccessTokenReducers,
  type AccessTokenRepository,
  type AccessTokenSecret,
  accessTokenSecretSymbol,
} from './access-token.ts';
import {
  type UserAccount,
  UserAccountReducers,
  type UserAccountRepository,
} from './user-account.ts';
import type { UserId } from './values.ts';

//#region AuthenticationConfigurationMap
export interface AuthenticationConfigurationMap extends ContextMap {
  readonly 'authentication.registration.emailSubjectTemplate': I18nMap;
  readonly 'authentication.registration.emailBodyTemplate': I18nMap;
  readonly 'authentication.registration.expiredAfterMs': number;
  readonly 'authentication.logIn.expiredAfterMs': number;
  readonly 'authentication.logIn.emailSubject': I18nMap;
  readonly 'authentication.logIn.emailBodyTemplate': I18nMap;
}

const authenticationDefaultConfigurationMap = {
  'authentication.registration.emailSubjectTemplate': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete registration',
    ja: '【${system.displayName}】確認コードを確認・入力してアカウントの作成を完了してください',
  },
  'authentication.registration.emailBodyTemplate': {
    en: `You are about to register for a new \${system.displayName} user account.
Please enter the following verification code into the \${system.displayName} app to complete registration.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* If you already have your \${system.displayName} user account, the email address you entered on the \${system.displayName} logIn screen may be incorrect. Use the email address you entered when you previously created your account.
* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `新しい\${system.displayName}のアカウントを作成しようとしています。
アカウントの作成を完了するには、\${system.displayName}の画面に確認コードを入力してください。

確認コード: \${emailVerification.verificationCode}

[!] 確認コードを他人と共有しないでください。

* すでに\${system.displayName}のアカウントを持っているのに、このメールが届いている場合は、\${system.displayName}のログイン画面に入力したメールアドレスが間違えている可能性があります。ログイン画面には、以前アカウントを作成した時に入力したメールアドレスを入力してください。
* このメールは\${system.displayName}のサーバから自動的に送信されています。このメールに返信することはできません。
* お心当たりのない場合は、このメールを破棄していただいてかまいません。
`,
  },
  'authentication.registration.expiredAfterMs': 5 * 60 * 1000,
  'authentication.logIn.emailSubject': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete the logIn',
    ja: '【${system.displayName}】確認コードを確認・入力してログインを完了してください',
  },
  'authentication.logIn.emailBodyTemplate': {
    en: `You are about to log in to the \${system.displayName} app.
Please enter the following verification code into the \${system.displayName} app to complete the logIn.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `\${system.displayName}にログインしようとしています。
ログインを完了するには、\${system.displayName}の画面に確認コードを入力してください。

確認コード: \${emailVerification.verificationCode}

[!] 確認コードを他人と共有しないでください。

* このメールは\${system.displayName}のサーバから自動的に送信されています。このメールに返信することはできません。
* お心当たりのない場合は、このメールを破棄していただいてかまいません。
`,
  },
  'authentication.logIn.expiredAfterMs': 5 * 60 * 1000,
} as const satisfies AuthenticationConfigurationMap;
//#endregion

//#region UserAuthenticationAttempt
export const authenticationAttemptTypeSymbol = Symbol('authenticationAttempt.type');
export const userAccountRegistrationAttemptTypeSymbol = Symbol(
  'userAccountRegistrationAttempt.type',
);
export const logInAttemptTypeSymbol = Symbol('logInAttempt.type');

export type AuthenticationAttemptId = NominalPrimitive<Id, typeof authenticationAttemptTypeSymbol>;

/**
 * 認証（ユーザアカウント作成、ログイン）の試行を表す。
 *
 * Eメールアドレス確認を用いた認証試行では、ユーザアカウントの作成やログインを行うために、クライアントは、その認証試行に関連付けて複数回サービスを呼び出す必要がある。
 * この型のオブジェクトは、認証試行が開始される際にその試行ごとに作成される。
 * 認証の完了や中止の際は、ユーザ認証の試行を指す識別子には、ユーザIDではなく、認証ごとに作成される認証試行のIDを用いる。
 */
export type AuthenticationAttempt = UserAccountRegistrationAttempt | LogInAttempt;

export type UserAccountRegistrationAttempt = ReturnType<
  typeof createUserAccountRegistrationAttempt
>;

export const createUserAccountRegistrationAttempt = <
  P extends {
    emailAddress: EmailAddress;
    ipAddress: string;
    userAgent: string;
    associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    [authenticationAttemptTypeSymbol]: authenticationAttemptTypeSymbol,
    [userAccountRegistrationAttemptTypeSymbol]: userAccountRegistrationAttemptTypeSymbol,
    id: generateId() as AuthenticationAttemptId,
    emailAddress: params.emailAddress,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    attemptedAt: new Date(),
    associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
  }) as const;

export type LogInAttempt = ReturnType<typeof createLogInAttempt>;

export const createLogInAttempt = <
  P extends {
    emailAddress: EmailAddress;
    ipAddress: string;
    userAgent: string;
    logInUserId: UserId;
    associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    [authenticationAttemptTypeSymbol]: authenticationAttemptTypeSymbol,
    [logInAttemptTypeSymbol]: logInAttemptTypeSymbol,
    id: generateId() as AuthenticationAttemptId,
    emailAddress: params.emailAddress,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    logInUserId: params.logInUserId,
    attemptedAt: new Date(),
    associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
  }) as const;

export const isUserAccountRegistrationAttempt = <S extends AuthenticationAttempt>(
  self: S,
): self is S & UserAccountRegistrationAttempt =>
  userAccountRegistrationAttemptTypeSymbol in self &&
  self[userAccountRegistrationAttemptTypeSymbol] === userAccountRegistrationAttemptTypeSymbol;

export const isLogInAttempt = <S extends AuthenticationAttempt>(
  self: S,
): self is S & LogInAttempt =>
  logInAttemptTypeSymbol in self && self[logInAttemptTypeSymbol] === logInAttemptTypeSymbol;

export type AuthenticationAttemptRepository = Repository<
  AuthenticationAttempt,
  AuthenticationAttemptId,
  'id'
>;
//#endregion

export const authenticationAttemptEventDataTypeSymbol = Symbol(
  'authenticationAttemptEventData.type',
);

//#region AuthenticationAttemptCompletedEventData
export type AuthenticationAttemptCompletedEventData = ReturnType<
  typeof createAuthenticationAttemptCompletedEventData
>;

export const createAuthenticationAttemptCompletedEventData = <
  P extends { id: AuthenticationAttemptId; completedAt: Date },
>(
  params: Readonly<P>,
) =>
  ({
    [authenticationAttemptEventDataTypeSymbol]: authenticationAttemptEventDataTypeSymbol,
    type: 'authenticationAttempt.completed',
    id: params.id,
    completedAt: params.completedAt,
  }) as const;

export type AuthenticationAttemptCompletedEventDataRepository = Repository<
  AuthenticationAttemptCompletedEventData,
  AuthenticationAttemptId,
  'id'
>;
//#endregion

//#region AuthenticationAttemptCanceledEventData
export type AuthenticationAttemptCanceledEventData = ReturnType<
  typeof createAuthenticationAttemptCanceledEventData
>;

export const createAuthenticationAttemptCanceledEventData = <
  P extends { id: AuthenticationAttemptId; canceledAt: Date },
>(
  params: Readonly<P>,
) =>
  ({
    [authenticationAttemptEventDataTypeSymbol]: authenticationAttemptEventDataTypeSymbol,
    type: 'authenticationAttempt.canceled',
    id: params.id,
    canceledAt: params.canceledAt,
  }) as const;

export type AuthenticationAttemptCanceledEventDataRepository = Repository<
  AuthenticationAttemptCanceledEventData,
  AuthenticationAttemptId,
  'id'
>;
//#endregion

//#region UserAuthenticationService
export type UserAuthenticationServiceDependencies = {
  readonly sendEmailVerificationChallenge: SendEmailVerificationChallenge;
  readonly answerEmailVerificationChallenge: AnswerEmailVerificationChallenge;
  readonly cancelEmailVerificationChallenge: CancelEmailVerificationChallenge;
  readonly authenticationAttemptRepository: AuthenticationAttemptRepository;
  readonly authenticationAttemptCompletedEventDataRepository: AuthenticationAttemptCompletedEventDataRepository;
  readonly authenticationAttemptCanceledEventDataRepository: AuthenticationAttemptCanceledEventDataRepository;
  readonly userAccountRepository: UserAccountRepository;
  readonly accessTokenRepository: AccessTokenRepository;
  readonly contextRepository: ContextRepository<
    AuthenticationConfigurationMap & AccessTokenConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap>;
};

/**
 * Eメールアドレスを指定して、Eメールアドレス確認を用いた認証試行（ユーザアカウントの作成またはログイン。{@linkcode AuthenticationAttempt}）を開始する。
 * - 指定されたEメールアドレスに対応するユーザアカウントが存在する場合は、{@linkcode AccessTokenLogInRequested}を作成して、ログインの試行を開始する。
 * - 指定されたEメールアドレスに対応するユーザアカウントが存在しない場合は、{@linkcode UserAccountRegistrationRequested}を作成して、ユーザアカウント作成の試行を開始する。
 * @returns 開始された認証試行のID、Eメールアドレス確認の送信日時、期限の日時を返す。
 * @throws 指定されたEメールアドレスに対する一定時間中の認証試行回数が制限を超えた場合は{@linkcode Exception}（`authentication.tooManyRequests`）を投げる。
 */
export const requestLogInOrRegistrationWithEmailVerification = async (
  params: {
    readonly emailAddress: EmailAddress;
    readonly ipAddress: string;
    readonly userAgent: string;
    readonly attemptCountPerEmailAddressTimeWindowRateLimitationRules: readonly TimeWindowRateLimitationRule[];
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly id: AuthenticationAttemptId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const nextAttemptedAt = await calculateNextExecutionDate({
    timeWindowRateLimitationRules: params.attemptCountPerEmailAddressTimeWindowRateLimitationRules,
    getNewestExecutionDateInLatestTimeWindow: async () =>
      (
        await params.authenticationAttemptRepository.getMany({
          filters: { emailAddress: params.emailAddress },
          orderBy: { attemptedAt: 'desc' },
          limit: 1,
        })
      )[0]?.attemptedAt ?? new Date(),
    getOldestExecutionDateInLatestTimeWindow: async (startOfLastTimeWindow: Date) =>
      (
        await params.authenticationAttemptRepository.getMany({
          filters: {
            emailAddress: params.emailAddress,
            attemptedAt: ['gte', startOfLastTimeWindow],
          },
          orderBy: { attemptedAt: 'asc' },
          limit: 1,
        })
      )[0]?.attemptedAt,
    countExecutionsInLatestTimeWindow: async (startOfLastTimeWindow: Date) =>
      params.authenticationAttemptRepository.count({
        filters: { emailAddress: params.emailAddress, attemptedAt: ['gte', startOfLastTimeWindow] },
      }),
  });
  if (new Date() < nextAttemptedAt) {
    throw Exception.create({ exceptionName: 'authentication.tooManyRequests' });
  }

  const userAccount = await params.userAccountRepository.getOneByEmailAddress(params.emailAddress);

  if (userAccount === undefined) {
    return requestRegistrationWithEmailVerification(params);
  }

  return requestLogInWithEmailVerification({ ...params, userAccount });
};

export type RequestLogInOrRegistrationWithEmailVerification = (
  params: Omit<
    Parameters<typeof requestLogInOrRegistrationWithEmailVerification>[0],
    keyof UserAuthenticationServiceDependencies
  >,
) => ReturnType<typeof requestLogInOrRegistrationWithEmailVerification>;

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いた認証試行（ユーザアカウントの作成またはログイン）を完了する。
 * @returns アクセストークン（{@linkcode AccessToken}）のシークレットとアクセストークンの有効期限を返す。
 * @throws 認証試行が見つからない場合は{@linkcode Exception}（`authenitcation.notExists`）を投げる。
 * @throws Eメールアドレス確認の確認コードが正しくない場合は{@linkcode Exception}（`authenitcation.verificationCodeIncorrect`）を投げる。
 */
export const completeLogInOrRegistrationWithEmailVerification = async (
  params: {
    readonly id: AuthenticationAttemptId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  readonly expiredAt: Date;
}> => {
  const attempt = await params.authenticationAttemptRepository.getOneById(params.id);
  const isCompleted =
    (await params.authenticationAttemptCompletedEventDataRepository.getOneById(params.id)) ?? false;
  const isCanceled =
    (await params.authenticationAttemptCanceledEventDataRepository.getOneById(params.id)) ?? false;

  if (attempt === undefined || isCompleted || isCanceled) {
    throw Exception.create({ exceptionName: 'authentication.notExists' });
  }

  if (isLogInAttempt(attempt)) {
    return completeLogInWithEmailVerification({ ...params, attempt });
  }

  return completeRegistrationWithEmailVerification({ ...params, attempt });
};

export type CompleteLogInOrRegistrationWithEmailVerification = (
  params: Omit<
    Parameters<typeof completeLogInOrRegistrationWithEmailVerification>[0],
    keyof UserAuthenticationServiceDependencies
  >,
) => ReturnType<typeof completeLogInOrRegistrationWithEmailVerification>;

/**
 * Eメールアドレス確認を用いたユーザアカウントの作成またはログインを中止する。
 * @throws 認証試行が見つからない場合は{@linkcode Exception}（`authenitcation.notExists`）を投げる。
 */
export const cancelLogInOrRegistrationWithEmailVerification = async (
  params: { readonly id: AuthenticationAttemptId } & UserAuthenticationServiceDependencies,
): Promise<void> => {
  const attempt = await params.authenticationAttemptRepository.getOneById(params.id);
  const isCompleted =
    (await params.authenticationAttemptCompletedEventDataRepository.getOneById(params.id)) ?? false;
  const isCanceled =
    (await params.authenticationAttemptCanceledEventDataRepository.getOneById(params.id)) ?? false;

  if (attempt === undefined || isCompleted || isCanceled) {
    throw Exception.create({ exceptionName: 'authentication.notExists' });
  }

  await params.cancelEmailVerificationChallenge({
    id: attempt.associatedEmailVerificationChallengeId,
  });

  await params.authenticationAttemptCanceledEventDataRepository.createOne(
    createAuthenticationAttemptCanceledEventData({ id: params.id, canceledAt: new Date() }),
  );
};

export type CancelLogInOrRegistrationWithEmailVerification = (
  params: Omit<
    Parameters<typeof cancelLogInOrRegistrationWithEmailVerification>[0],
    keyof UserAuthenticationServiceDependencies
  >,
) => ReturnType<typeof cancelLogInOrRegistrationWithEmailVerification>;

//#endregion

//#region LogInService

/**
 * Eメールアドレス確認を用いたログインを開始する。
 */
const requestLogInWithEmailVerification = async (
  params: {
    readonly userAccount: UserAccount;
    readonly ipAddress: string;
    readonly userAgent: string;
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly id: AuthenticationAttemptId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const acceptedLanguages = params.clientContextRepository.get('client.acceptedLanguages');

  const {
    id: associatedEmailVerificationChallengeId,
    sentAt,
    expiredAt,
  } = await params.sendEmailVerificationChallenge({
    emailAddress: params.userAccount.emailAddress,
    emailSubjectTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('authentication.logIn.emailSubject'),
    }),
    emailBodyTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('authentication.logIn.emailBodyTemplate'),
    }),
    expiredAfterMs: params.contextRepository.get('authentication.logIn.expiredAfterMs'),
    valuesForTemplatePlaceholders: {
      'system.displayName': localize({
        acceptedLanguages,
        i18nMap: params.contextRepository.get('system.displayName'),
      }),
    },
  });

  const attempt = createLogInAttempt({
    emailAddress: params.userAccount.emailAddress,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    logInUserId: params.userAccount.id,
    associatedEmailVerificationChallengeId,
  });
  await params.authenticationAttemptRepository.createOne(attempt);

  return { id: attempt.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いたログインを完了する。
 */
const completeLogInWithEmailVerification = async (
  params: {
    readonly attempt: FromRepository<AuthenticationAttempt> & LogInAttempt;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  readonly expiredAt: Date;
}> => {
  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: params.attempt.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({ exceptionName: 'authentication.verificationCodeIncorrect' });
  }

  const accessToken = AccessTokenReducers.create({
    ipAddress: params.attempt.ipAddress,
    userAgent: params.attempt.userAgent,
    logInUserId: params.attempt.logInUserId,
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });
  await params.accessTokenRepository.createOne(accessToken);

  await params.authenticationAttemptCompletedEventDataRepository.createOne(
    createAuthenticationAttemptCompletedEventData({
      id: params.attempt.id,
      completedAt: new Date(),
    }),
  );

  return {
    [accessTokenSecretSymbol]: accessToken[accessTokenSecretSymbol],
    expiredAt: accessToken.expiredAt,
  };
};
//#endregion

//#region UserAccountRegistrationService

/** Eメールアドレス確認を用いたユーザアカウントの作成を開始する。 */
const requestRegistrationWithEmailVerification = async (
  params: {
    readonly emailAddress: EmailAddress;
    readonly ipAddress: string;
    readonly userAgent: string;
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly id: AuthenticationAttemptId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const acceptedLanguages = params.clientContextRepository.get('client.acceptedLanguages');

  const {
    id: associatedEmailVerificationChallengeId,
    sentAt,
    expiredAt,
  } = await params.sendEmailVerificationChallenge({
    emailAddress: params.emailAddress,
    emailSubjectTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('authentication.registration.emailSubjectTemplate'),
    }),
    emailBodyTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('authentication.registration.emailBodyTemplate'),
    }),
    expiredAfterMs: params.contextRepository.get('authentication.registration.expiredAfterMs'),
    valuesForTemplatePlaceholders: {
      'system.displayName': localize({
        acceptedLanguages,
        i18nMap: params.contextRepository.get('system.displayName'),
      }),
    },
  });

  const attempt = createUserAccountRegistrationAttempt({
    emailAddress: params.emailAddress,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    associatedEmailVerificationChallengeId,
  });
  await params.authenticationAttemptRepository.createOne(attempt);

  return { id: attempt.id, sentAt, expiredAt };
};

/** Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いたユーザアカウントの作成を完了する。 */
const completeRegistrationWithEmailVerification = async (
  params: {
    readonly attempt: FromRepository<AuthenticationAttempt> & UserAccountRegistrationAttempt;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{
  readonly [accessTokenSecretSymbol]: AccessTokenSecret;
  readonly expiredAt: Date;
}> => {
  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: params.attempt.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({ exceptionName: 'authentication.verificationCodeIncorrect' });
  }

  const userAccount = UserAccountReducers.create({ emailAddress: params.attempt.emailAddress });
  await params.userAccountRepository.createOne(userAccount);

  const accessToken = AccessTokenReducers.create({
    ipAddress: params.attempt.ipAddress,
    userAgent: params.attempt.userAgent,
    logInUserId: userAccount.id,
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });
  await params.accessTokenRepository.createOne(accessToken);

  await params.authenticationAttemptCompletedEventDataRepository.createOne(
    createAuthenticationAttemptCompletedEventData({
      id: params.attempt.id,
      completedAt: new Date(),
    }),
  );

  return {
    [accessTokenSecretSymbol]: accessToken[accessTokenSecretSymbol],
    expiredAt: accessToken.expiredAt,
  };
};
//#endregion
