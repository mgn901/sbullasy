import type {
  AccessControlServiceDependencies,
  verifyAccessTokenAndGetLoginUserAccount,
} from '../../lib/access-control.ts';
import type {
  ContextMap,
  ContextRepository,
  I18nMap,
  RequestContextMap,
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
import { generateId } from '../../lib/random-values/id.ts';
import type { FieldsOf, PickEssential, PreApplied, TypedInstance } from '../../lib/type-utils.ts';
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
    ja: '【${system.displayName}】確認コードを確認・入力してメールアドレスの変更を完了してください',
  },
  'userAccount.emailAddressUpdate.emailBodyTemplate': {
    en: `You are about to changing the email address registered to the \${system.displayName} app.
Please enter the following verification code into the \${system.displayName} app to complete the email address change.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `\${system.displayName}に登録されているEメールアドレスを変更しようとしています。
変更を完了するには、\${system.displayName}の画面に確認コードを入力してください。

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
abstract class UserAccountBase {
  public readonly id: UserId;
  public readonly emailAddress: EmailAddress;

  //#region constructors
  public constructor(params: FieldsOf<UserAccountBase>) {
    this.id = params.id;
    this.emailAddress = params.emailAddress;
  }
  //#endregion
}

export class UserAccountRegistrationRequested extends UserAccountBase {
  public readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;

  public static create<
    P extends {
      readonly emailAddress: TEmailAddress;
      readonly associatedEmailVerificationChallengeId: TEmailVerificationChallengeId;
    },
    TEmailAddress extends EmailAddress,
    TEmailVerificationChallengeId extends EmailVerificationChallengeId,
  >(
    this: unknown,
    params: P,
  ): TypedInstance<UserAccountRegistrationRequested, P & { readonly id: UserId }> {
    return UserAccountRegistrationRequested.from({ ...params, id: generateId() as UserId });
  }

  public toRegistrationCompleted<T extends UserAccountRegistrationRequested>(
    this: T,
  ): TypedInstance<UserAccountRegistered, T & { readonly registeredAt: Date }> {
    return UserAccountRegistered.from({ ...this, registeredAt: new Date() });
  }

  //#region constructors
  public static from<P extends FieldsOf<UserAccountRegistrationRequested>>(
    params: PickEssential<P, keyof FieldsOf<UserAccountRegistrationRequested>>,
  ): TypedInstance<UserAccountRegistrationRequested, P> {
    return new UserAccountRegistrationRequested(params) as TypedInstance<
      UserAccountRegistrationRequested,
      P
    >;
  }

  private constructor(params: FieldsOf<UserAccountRegistrationRequested>) {
    super(params);
    this.associatedEmailVerificationChallengeId = params.associatedEmailVerificationChallengeId;
  }
  //#endregion
}

export class UserAccountRegistered extends UserAccountBase {
  public readonly registeredAt: Date;

  public toEmailAddressUpdateRequested<
    P extends {
      readonly newEmailAddress: TNewEmailAddress;
      readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
    },
    T extends UserAccountRegistered,
    TNewEmailAddress extends EmailAddress = EmailAddress,
  >(this: T, params: P): TypedInstance<UserAccountEmailAddressUpdateRequested, T & P> {
    return UserAccountEmailAddressUpdateRequested.from({ ...this, ...params });
  }

  //#region constructors
  public static from<P extends FieldsOf<UserAccountRegistered>>(
    this: unknown,
    params: PickEssential<P, keyof FieldsOf<UserAccountRegistered>>,
  ): TypedInstance<UserAccountRegistered, P> {
    return new UserAccountRegistered(params) as TypedInstance<UserAccountRegistered, P>;
  }

  private constructor(params: FieldsOf<UserAccountRegistered>) {
    super(params);
    this.registeredAt = params.registeredAt;
  }
  //#endregion
}

export class UserAccountEmailAddressUpdateRequested extends UserAccountBase {
  public readonly registeredAt: Date;
  public readonly newEmailAddress: EmailAddress;
  public readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;

  public toEmailAddressUpdateCompleted<
    T extends UserAccountEmailAddressUpdateRequested & {
      readonly newEmailAddress: TNewEmailAddress;
    },
    TNewEmailAddress extends EmailAddress = EmailAddress,
  >(
    this: T,
  ): TypedInstance<UserAccountRegistered, T & { readonly emailAddress: T['newEmailAddress'] }> {
    return UserAccountRegistered.from({ ...this, emailAddress: this.newEmailAddress });
  }

  public toEmailAddressUpdateCanceled<T extends UserAccountEmailAddressUpdateRequested>(
    this: T,
  ): TypedInstance<UserAccountRegistered, T> {
    return UserAccountRegistered.from({ ...this });
  }

  //#region constructors
  public static from<P extends FieldsOf<UserAccountEmailAddressUpdateRequested>>(
    this: unknown,
    params: PickEssential<P, keyof FieldsOf<UserAccountEmailAddressUpdateRequested>>,
  ): TypedInstance<UserAccountEmailAddressUpdateRequested, P> {
    return new UserAccountEmailAddressUpdateRequested(params) as TypedInstance<
      UserAccountEmailAddressUpdateRequested,
      P
    >;
  }

  private constructor(params: FieldsOf<UserAccountEmailAddressUpdateRequested>) {
    super(params);
    this.registeredAt = params.registeredAt;
    this.associatedEmailVerificationChallengeId = params.associatedEmailVerificationChallengeId;
    this.newEmailAddress = params.newEmailAddress;
  }
  //#endregion
}

/**
 * ユーザアカウントを表す。
 *
 * この型のオブジェクトはユーザアカウントの作成が開始される際に作成される。
 */
export type UserAccount =
  | UserAccountRegistrationRequested
  | UserAccountRegistered
  | UserAccountEmailAddressUpdateRequested;

export interface UserAccountRepository {
  getOneById<TId extends UserId>(
    this: UserAccountRepository,
    id: TId,
  ): Promise<(UserAccount & { readonly id: TId }) | undefined>;

  getOneByEmailAddress<TEmailAddress extends EmailAddress>(
    this: UserAccountRepository,
    emailAddress: TEmailAddress,
  ): Promise<(UserAccount & { readonly emailAddress: TEmailAddress }) | undefined>;

  getMany(
    this: UserAccountRepository,
    params: {
      readonly filters?:
        | {
            readonly createdAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | {
            readonly registeredAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
          }
        | undefined;
      readonly orderBy:
        | { readonly id: 'asc' | 'desc' }
        | { readonly emailAddress: 'asc' | 'desc' }
        | { readonly createdAt: 'asc' | 'desc' }
        | { readonly registeredAt: 'asc' | 'desc' };
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly UserAccount[] | readonly []>;

  createOne(
    this: UserAccountRepository,
    userAccountOrUserAccountUpdateRequested: UserAccount,
  ): Promise<void>;

  updateOne(
    this: UserAccountRepository,
    userAccountOrUserAccountUpdateRequested: UserAccount,
  ): Promise<void>;

  deleteOneById(this: UserAccountRepository, id: UserId): Promise<void>;
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
  readonly verifyAccessTokenAndGetLoginUserAccount: PreApplied<
    typeof verifyAccessTokenAndGetLoginUserAccount,
    AccessControlServiceDependencies
  >;
  readonly userAccountRepository: UserAccountRepository;
  readonly contextRepository: ContextRepository<
    UserAccountConfigurationMap & SystemConfigurationMap
  >;
  readonly requestContextRepository: ContextRepository<RequestContextMap>;
}

/**
 * 自分自身の{@link UserAccount}を取得する。
 */
export const getMyUserAccount = async (
  params: UserAccountServiceDependencies,
): Promise<{ readonly userAccount: UserAccount }> => {
  return params.verifyAccessTokenAndGetLoginUserAccount({
    accessTokenSecret: params.requestContextRepository.get('request.accessTokenSecret'),
  });
};

/**
 * Eメールアドレスの変更を開始する。
 *
 * 変更後のEメールアドレスにEメールアドレス確認の確認コードを送信する。
 */
export const requestEmailAddressUpdate = async (
  params: { readonly newEmailAddress: EmailAddress } & UserAccountServiceDependencies,
): Promise<{ readonly userId: UserId; readonly sentAt: Date; readonly expiredAt: Date }> => {
  const { userAccount } = await params.verifyAccessTokenAndGetLoginUserAccount({
    accessTokenSecret: params.requestContextRepository.get('request.accessTokenSecret'),
  });
  if (userAccount instanceof UserAccountRegistered === false) {
    throw new Exception({ exceptionName: 'userAccount.notExists' });
  }

  const acceptedLanguages = params.requestContextRepository.get('request.acceptedLanguages');

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

  const userAccountEmailAddressUpdateRequested = userAccount.toEmailAddressUpdateRequested({
    newEmailAddress: params.newEmailAddress,
    associatedEmailVerificationChallengeId,
  });
  await params.userAccountRepository.updateOne(userAccountEmailAddressUpdateRequested);

  return { userId: userAccountEmailAddressUpdateRequested.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、Eメールアドレスの更新を完了する。
 */
export const completeEmailAddressUpdate = async (
  params: {
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & UserAccountServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessTokenAndGetLoginUserAccount({
    accessTokenSecret: params.requestContextRepository.get('request.accessTokenSecret'),
  });
  if (userAccount instanceof UserAccountEmailAddressUpdateRequested === false) {
    throw new Exception({ exceptionName: 'userAccount.notExists' });
  }

  const { isCorrect } = await params.answerEmailVerificationChallenge({
    id: userAccount.associatedEmailVerificationChallengeId,
    enteredVerificationCode: params.enteredVerificationCode,
  });
  if (isCorrect === false) {
    throw new Exception({ exceptionName: 'userAccount.verificationCodeIncorrect' });
  }

  const userAccountEmailAddressUpdateCompleted = userAccount.toEmailAddressUpdateCompleted();
  await params.userAccountRepository.updateOne(userAccountEmailAddressUpdateCompleted);
};

/** Eメールアドレスの変更を中止する。 */
export const cancelEmailAddressUpdate = async (params: UserAccountServiceDependencies) => {
  const { userAccount } = await params.verifyAccessTokenAndGetLoginUserAccount({
    accessTokenSecret: params.requestContextRepository.get('request.accessTokenSecret'),
  });
  if (userAccount instanceof UserAccountEmailAddressUpdateRequested === false) {
    throw new Exception({ exceptionName: 'userAccount.notExists' });
  }

  await params.cancelEmailVerificationChallenge({
    id: userAccount.associatedEmailVerificationChallengeId,
  });

  const userAccountEmailAddressUpdateCanceled = userAccount.toEmailAddressUpdateCanceled();
  await params.userAccountRepository.updateOne(userAccountEmailAddressUpdateCanceled);
};

/**
 * ユーザアカウントを削除する。
 */
export const deleteMyUserAccount = async (
  params: UserAccountServiceDependencies,
): Promise<void> => {
  const { userAccount } = await params.verifyAccessTokenAndGetLoginUserAccount({
    accessTokenSecret: params.requestContextRepository.get('request.accessTokenSecret'),
  });

  params.userAccountRepository.deleteOneById(userAccount.id);
};
//#endregion
