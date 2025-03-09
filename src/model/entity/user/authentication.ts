import {
  type TimeWindowRateLimitationRule,
  calculateNextExecutionDate,
} from '../../../utils/time-window-rate-limitation.ts';
import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type {
  ClientContextMap,
  ContextMap,
  ContextRepository,
  I18nMap,
  SystemConfigurationMap,
} from '../../lib/context.ts';
import type {
  EmailVerificationChallengeVerificationCode,
  EmailVerificationServiceDependencies,
  answer,
  cancel,
  send,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { localize } from '../../lib/i18n.ts';
import { type Id, generateId } from '../../lib/random-values/id.ts';
import type { FieldsOf, PickEssential, PreApplied, TypedInstance } from '../../lib/type-utils.ts';
import type { EmailAddress } from '../../values.ts';
import {
  type AccessTokenConfigurationMap,
  type AccessTokenId,
  AccessTokenLogInRequested,
  type AccessTokenRepository,
  type AccessTokenSecret,
  accessTokenSymbol,
} from './access-token.ts';
import {
  type UserAccountEmailAddressUpdateRequested,
  type UserAccountRegistered,
  UserAccountRegistrationRequested,
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

//#region UserAuthenticationAttempt and UserAuthenticationAttemptRepository
const authenticationAttemptTypeSymbol = Symbol();

export type AuthenticationAttemptId = NominalPrimitive<Id, typeof authenticationAttemptTypeSymbol>;

/**
 * 認証（ユーザアカウント作成、ログイン）の試行を表す。
 *
 * Eメールアドレス確認を用いた認証試行では、ユーザアカウントの作成やログインを行うために、クライアントは、その認証試行に関連付けて複数回サービスを呼び出す必要がある。
 * この型のオブジェクトは、認証試行が開始される際にその試行ごとに作成される。
 * 認証の完了や中止の際は、ユーザ認証の試行を指す識別子には、ユーザIDではなく、認証ごとに作成される認証試行のIDを用いる。
 */
export type AuthenticationAttempt =
  | UserAccountRegistrationAttempt
  | UserAccountRegistrationAttemptTerminated
  | LogInAttempt
  | LogInAttemptTerminated;

abstract class AuthenticationAttemptBase {
  public readonly id: AuthenticationAttemptId;
  public readonly emailAddress: EmailAddress;
  public readonly ipAddress: string;
  public readonly userAgent: string;
  public readonly attemptedAt: Date;

  //#region constructors
  public constructor(params: FieldsOf<AuthenticationAttemptBase>) {
    this.id = params.id;
    this.emailAddress = params.emailAddress;
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.attemptedAt = params.attemptedAt;
  }
  //#endregion
}

/**
 * ユーザアカウント作成の試行で終了していないものを表す。
 */
export class UserAccountRegistrationAttempt extends AuthenticationAttemptBase {
  public readonly associatedUserId: UserId;

  /**
   * 新しいユーザアカウント作成の試行を作成する。
   *
   * @param params `associatedUserId`には、作成しようとしているユーザのIDを指定する。
   */
  public static create<
    P extends {
      readonly emailAddress: EmailAddress;
      readonly ipAddress: string;
      readonly userAgent: string;
      readonly associatedUserId: UserId;
    },
  >(
    params: P,
  ): TypedInstance<
    UserAccountRegistrationAttempt,
    P & { readonly id: AuthenticationAttemptId; readonly attemptedAt: Date }
  > {
    return UserAccountRegistrationAttempt.from({
      ...params,
      id: generateId() as AuthenticationAttemptId,
      attemptedAt: new Date(),
    });
  }

  /**
   * この試行を完了にしたものを返す。
   */
  public toCompleted<T extends UserAccountRegistrationAttempt>(
    this: T,
  ): TypedInstance<UserAccountRegistrationAttemptTerminated, T & { readonly status: 'completed' }> {
    return UserAccountRegistrationAttemptTerminated.from({ ...this, status: 'completed' });
  }

  /**
   * この試行を中止にしたものを返す。
   */
  public toCanceled<T extends UserAccountRegistrationAttempt>(
    this: T,
  ): TypedInstance<UserAccountRegistrationAttemptTerminated, T & { readonly status: 'canceled' }> {
    return UserAccountRegistrationAttemptTerminated.from({ ...this, status: 'canceled' });
  }

  //#region constructors
  public static from<P extends FieldsOf<UserAccountRegistrationAttempt>>(
    params: PickEssential<P, keyof FieldsOf<UserAccountRegistrationAttempt>>,
  ): TypedInstance<UserAccountRegistrationAttempt, P> {
    return new UserAccountRegistrationAttempt(params) as TypedInstance<
      UserAccountRegistrationAttempt,
      P
    >;
  }

  private constructor(params: FieldsOf<UserAccountRegistrationAttempt>) {
    super(params);
    this.associatedUserId = params.associatedUserId;
  }
  //#endregion
}

/**
 * ユーザアカウント作成の試行で終了したものを表す。
 */
export class UserAccountRegistrationAttemptTerminated extends AuthenticationAttemptBase {
  public readonly associatedUserId: UserId;
  public readonly status: 'canceled' | 'completed';

  //#region constructors
  public static from<P extends FieldsOf<UserAccountRegistrationAttemptTerminated>>(
    params: PickEssential<P, keyof FieldsOf<UserAccountRegistrationAttemptTerminated>>,
  ): TypedInstance<UserAccountRegistrationAttemptTerminated, P> {
    return new UserAccountRegistrationAttemptTerminated(params) as TypedInstance<
      UserAccountRegistrationAttemptTerminated,
      P
    >;
  }

  private constructor(params: FieldsOf<UserAccountRegistrationAttemptTerminated>) {
    super(params);
    this.associatedUserId = params.associatedUserId;
    this.status = params.status;
  }
  //#endregion
}

/**
 * ログインの試行で終了していないものを表す。
 */
export class LogInAttempt extends AuthenticationAttemptBase {
  public readonly associatedAccessTokenId: AccessTokenId;

  /**
   * 新しいログインの試行を作成する。
   *
   * @param params `associatedAccessTokenId`には、作成しようとしているアクセストークンを指定する。
   */
  public static create<
    P extends {
      readonly emailAddress: EmailAddress;
      readonly ipAddress: string;
      readonly userAgent: string;
      readonly associatedAccessTokenId: AccessTokenId;
    },
  >(
    params: P,
  ): TypedInstance<
    LogInAttempt,
    P & { readonly id: AuthenticationAttemptId; readonly attemptedAt: Date }
  > {
    return LogInAttempt.from({
      ...params,
      id: generateId() as AuthenticationAttemptId,
      attemptedAt: new Date(),
    });
  }

  /**
   * この試行を完了にしたものを返す。
   */
  public toCompleted<T extends LogInAttempt>(
    this: T,
  ): TypedInstance<LogInAttemptTerminated, T & { readonly status: 'completed' }> {
    return LogInAttemptTerminated.from({ ...this, status: 'completed' });
  }

  /**
   * この試行を中止にしたものを返す。
   */
  public toCanceled<T extends LogInAttempt>(
    this: T,
  ): TypedInstance<LogInAttemptTerminated, T & { readonly status: 'canceled' }> {
    return LogInAttemptTerminated.from({ ...this, status: 'canceled' });
  }

  //#region constructors
  public static from<P extends FieldsOf<LogInAttempt>>(
    params: PickEssential<P, keyof FieldsOf<LogInAttempt>>,
  ): TypedInstance<LogInAttempt, P> {
    return new LogInAttempt(params) as TypedInstance<LogInAttempt, P>;
  }

  private constructor(params: FieldsOf<LogInAttempt>) {
    super(params);
    this.associatedAccessTokenId = params.associatedAccessTokenId;
  }
  //#endregion
}

/**
 * ログインの試行で終了したものを表す。
 */
export class LogInAttemptTerminated extends AuthenticationAttemptBase {
  public readonly associatedAccessTokenId: AccessTokenId;
  public readonly status: 'canceled' | 'completed';

  //#region constructors
  public static from<P extends FieldsOf<LogInAttemptTerminated>>(
    params: PickEssential<P, keyof FieldsOf<LogInAttemptTerminated>>,
  ): TypedInstance<LogInAttemptTerminated, P> {
    return new LogInAttemptTerminated(params) as TypedInstance<LogInAttemptTerminated, P>;
  }

  private constructor(params: FieldsOf<LogInAttemptTerminated>) {
    super(params);
    this.associatedAccessTokenId = params.associatedAccessTokenId;
    this.status = params.status;
  }
  //#endregion
}

export interface AuthenticationAttemptRepository {
  getOneById<TUserAuthenticationAttemptId extends AuthenticationAttemptId>(
    this: AuthenticationAttemptRepository,
    id: TUserAuthenticationAttemptId,
  ): Promise<(AuthenticationAttempt & { readonly id: TUserAuthenticationAttemptId }) | undefined>;

  getMany(
    this: unknown,
    params: {
      readonly filters?:
        | {
            readonly emailAddress?: string | undefined;
            readonly ipAddress?: string | undefined;
            readonly userAgent?: string | undefined;
            readonly attemptedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
      readonly orderBy:
        | { readonly emailAddress: 'asc' | 'desc' }
        | { readonly ipAddress: 'asc' | 'desc' }
        | { readonly userAgent: 'asc' | 'desc' }
        | { readonly attemptedAt: 'asc' | 'desc' };
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly AuthenticationAttempt[] | readonly []>;

  count(
    this: unknown,
    params: {
      readonly filters?:
        | {
            readonly emailAddress?: string | undefined;
            readonly ipAddress?: string | undefined;
            readonly userAgent?: string | undefined;
            readonly attemptedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
    },
  ): Promise<number>;

  createOne(
    this: AuthenticationAttemptRepository,
    userAuthenticationAttempt: AuthenticationAttempt,
  ): Promise<void>;

  updateOne(
    this: AuthenticationAttemptRepository,
    userAuthenticationAttempt: AuthenticationAttempt,
  ): Promise<void>;

  deleteOneById(this: AuthenticationAttemptRepository, id: AuthenticationAttemptId): Promise<void>;
}
//#endregion

//#region UserAuthenticationService
export interface UserAuthenticationServiceDependencies {
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
  readonly authenticationAttemptRepository: AuthenticationAttemptRepository;
  readonly userAccountRepository: UserAccountRepository;
  readonly accessTokenRepository: AccessTokenRepository;
  readonly contextRepository: ContextRepository<
    AuthenticationConfigurationMap & AccessTokenConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap>;
}

/**
 * Eメールアドレスを指定して、Eメールアドレス確認を用いた認証試行（ユーザアカウントの作成またはログイン。{@linkcode AuthenticationAttempt}）を開始する。
 *
 * - 指定されたEメールアドレスに対応するユーザアカウントが存在し、作成が完了している場合は、{@linkcode AccessTokenLogInRequested}を作成して、ログインの試行を開始する。
 * - 指定されたEメールアドレスに対応するユーザアカウントが存在しない、または作成が完了していない場合は、{@linkcode UserAccountRegistrationRequested}を作成して、ユーザアカウント作成の試行を開始する。
 *
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
            attemptedAt: { from: startOfLastTimeWindow },
          },
          orderBy: { attemptedAt: 'asc' },
          limit: 1,
        })
      )[0]?.attemptedAt,
    countExecutionsInLatestTimeWindow: async (startOfLastTimeWindow: Date) =>
      params.authenticationAttemptRepository.count({
        filters: {
          emailAddress: params.emailAddress,
          attemptedAt: { from: startOfLastTimeWindow },
        },
      }),
  });
  if (nextAttemptedAt.getTime() > Date.now()) {
    throw Exception.create({ exceptionName: 'authentication.tooManyRequests' });
  }

  const userAccount = await params.userAccountRepository.getOneByEmailAddress(params.emailAddress);

  if (userAccount === undefined) {
    return requestRegistrationWithEmailVerification(params);
  }

  if (userAccount instanceof UserAccountRegistrationRequested) {
    await params.cancelEmailVerificationChallenge({
      id: userAccount.associatedEmailVerificationChallengeId,
    });
    await params.userAccountRepository.deleteOneById(userAccount.id);

    return requestRegistrationWithEmailVerification(params);
  }

  return requestLogInWithEmailVerification({ ...params, userAccount });
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いた認証試行（ユーザアカウントの作成またはログイン）を完了する。
 *
 * @returns アクセストークン（{@linkcode AccessToken}）のシークレットを返す。
 * @throws 認証試行が見つからない場合は{@linkcode Exception}（`authenitcation.notExists`）を投げる。
 * @throws Eメールアドレス確認の確認コードが正しくない場合は{@linkcode Exception}（`authenitcation.verificationCodeIncorrect`）を投げる。
 */
export const completeLogInOrRegistrationWithEmailVerification = async (
  params: {
    readonly id: AuthenticationAttemptId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{ readonly [accessTokenSymbol.secret]: AccessTokenSecret }> => {
  const attempt = await params.authenticationAttemptRepository.getOneById(params.id);

  if (attempt instanceof LogInAttempt) {
    const accessToken = await params.accessTokenRepository.getOneById(
      attempt.associatedAccessTokenId,
    );
    if (accessToken instanceof AccessTokenLogInRequested) {
      return completeLogInWithEmailVerification({ ...params, attempt, accessToken });
    }
  }

  if (attempt instanceof UserAccountRegistrationAttempt) {
    const userAccount = await params.userAccountRepository.getOneById(attempt.associatedUserId);
    if (userAccount instanceof UserAccountRegistrationRequested) {
      return completeRegistrationWithEmailVerification({ ...params, attempt, userAccount });
    }
  }

  throw Exception.create({ exceptionName: 'authentication.notExists' });
};

/**
 * Eメールアドレス確認を用いたユーザアカウントの作成またはログインを中止する。
 *
 * @throws 認証試行が見つからない場合は{@linkcode Exception}（`authenitcation.notExists`）を投げる。
 */
export const cancelLogInOrRegistrationWithEmailVerification = async (
  params: { readonly id: AuthenticationAttemptId } & UserAuthenticationServiceDependencies,
): Promise<void> => {
  const attempt = await params.authenticationAttemptRepository.getOneById(params.id);

  if (attempt instanceof LogInAttempt) {
    const accessToken = await params.accessTokenRepository.getOneById(
      attempt.associatedAccessTokenId,
    );
    if (accessToken instanceof AccessTokenLogInRequested) {
      await cancelLogInWithEmailVerification({ ...params, attempt, accessToken });
      return;
    }
  }

  if (attempt instanceof UserAccountRegistrationAttempt) {
    const userAccount = await params.userAccountRepository.getOneById(attempt.associatedUserId);
    if (userAccount instanceof UserAccountRegistrationRequested) {
      await cancelRegistrationWithEmailVerification({ ...params, attempt, userAccount });
      return;
    }
  }

  throw Exception.create({ exceptionName: 'authentication.notExists' });
};
//#endregion

//#region LogInService

/**
 * Eメールアドレス確認を用いたログインを開始する。
 */
const requestLogInWithEmailVerification = async (
  params: {
    readonly userAccount: UserAccountRegistered | UserAccountEmailAddressUpdateRequested;
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

  const accessToken = AccessTokenLogInRequested.create({
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    associatedEmailVerificationChallengeId,
    logInUserId: params.userAccount.id,
  });
  await params.accessTokenRepository.createOne(accessToken);

  const attempt = LogInAttempt.create({
    emailAddress: params.userAccount.emailAddress,
    associatedAccessTokenId: accessToken.id,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
  await params.authenticationAttemptRepository.createOne(attempt);

  return { id: attempt.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いたログインを完了する。
 */
const completeLogInWithEmailVerification = async (
  params: {
    readonly attempt: LogInAttempt;
    readonly accessToken: AccessTokenLogInRequested;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{ readonly [accessTokenSymbol.secret]: AccessTokenSecret }> => {
  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: params.accessToken.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({ exceptionName: 'authentication.verificationCodeIncorrect' });
  }

  const accessTokenLogInCompleted = params.accessToken.toLogInCompleted({
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });
  await params.accessTokenRepository.updateOne(accessTokenLogInCompleted);

  const attemptCompleted = params.attempt.toCompleted();
  await params.authenticationAttemptRepository.updateOne(attemptCompleted);

  return { [accessTokenSymbol.secret]: accessTokenLogInCompleted[accessTokenSymbol.secret] };
};

/**
 * Eメールアドレス確認を用いたログインを中止する。
 */
const cancelLogInWithEmailVerification = async (
  params: {
    readonly attempt: LogInAttempt;
    readonly accessToken: AccessTokenLogInRequested;
  } & UserAuthenticationServiceDependencies,
): Promise<void> => {
  await params.cancelEmailVerificationChallenge({
    id: params.accessToken.associatedEmailVerificationChallengeId,
  });

  await params.accessTokenRepository.deleteOneById(params.accessToken.id);

  const attemptCanceled = params.attempt.toCanceled();
  await params.authenticationAttemptRepository.updateOne(attemptCanceled);
};
//#endregion

//#region UserAccountRegistrationService

/**
 * Eメールアドレス確認を用いたユーザアカウントの作成を開始する。
 */
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

  const userAccount = UserAccountRegistrationRequested.create({
    emailAddress: params.emailAddress,
    associatedEmailVerificationChallengeId,
  });
  await params.userAccountRepository.createOne(userAccount);

  const attempt = UserAccountRegistrationAttempt.create({
    emailAddress: params.emailAddress,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    associatedUserId: userAccount.id,
  });
  await params.authenticationAttemptRepository.createOne(attempt);

  return { id: attempt.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレス確認を用いたユーザアカウントの作成を完了する。
 */
const completeRegistrationWithEmailVerification = async (
  params: {
    readonly attempt: UserAccountRegistrationAttempt;
    readonly userAccount: UserAccountRegistrationRequested;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAuthenticationServiceDependencies,
): Promise<{ readonly [accessTokenSymbol.secret]: AccessTokenSecret }> => {
  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: params.userAccount.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw Exception.create({ exceptionName: 'authentication.verificationCodeIncorrect' });
  }

  const userAccountRegistrationCompleted = params.userAccount.toRegistrationCompleted();
  await params.userAccountRepository.updateOne(userAccountRegistrationCompleted);

  const attemptCompleted = params.attempt.toCompleted();
  await params.authenticationAttemptRepository.updateOne(attemptCompleted);

  const accessToken = AccessTokenLogInRequested.create({
    ipAddress: attemptCompleted.ipAddress,
    userAgent: attemptCompleted.userAgent,
    logInUserId: userAccountRegistrationCompleted.id,
    associatedEmailVerificationChallengeId:
      params.userAccount.associatedEmailVerificationChallengeId,
  }).toLogInCompleted({
    expiredAfterMs: params.contextRepository.get('accessToken.expiredAfterMs'),
  });
  await params.accessTokenRepository.createOne(accessToken);

  return { [accessTokenSymbol.secret]: accessToken[accessTokenSymbol.secret] };
};

/**
 * Eメールアドレス確認を用いたユーザアカウントの作成を中止する。
 */
const cancelRegistrationWithEmailVerification = async (
  params: {
    readonly attempt: UserAccountRegistrationAttempt;
    readonly userAccount: UserAccountRegistrationRequested;
  } & UserAuthenticationServiceDependencies,
): Promise<void> => {
  await params.cancelEmailVerificationChallenge({
    id: params.userAccount.associatedEmailVerificationChallengeId,
  });

  await params.userAccountRepository.deleteOneById(params.userAccount.id);

  const attemptCanceled = params.attempt.toCanceled();
  await params.authenticationAttemptRepository.updateOne(attemptCanceled);
};
//#endregion
