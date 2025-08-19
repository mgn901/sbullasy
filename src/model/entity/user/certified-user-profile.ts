import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { PreApplied } from '@mgn901/mgn901-utils-ts/pre-apply';
import type { FromRepository } from '@mgn901/mgn901-utils-ts/repository-utils';
import type {
  AccessControlServiceDependencies,
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
  EmailVerificationChallengeId,
  EmailVerificationChallengeVerificationCode,
  EmailVerificationServiceDependencies,
  PreAppliedAnswer,
  PreAppliedSend,
} from '../../lib/email-verification.ts';
import { Exception } from '../../lib/exception.ts';
import { localize } from '../../lib/i18n.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import type { DisplayName, EmailAddress, Name } from '../../values.ts';
import type { MembershipRepository } from './membership.ts';
import {
  type RequestWithEmailVerificationChallenge,
  RequestWithEmailVerificationChallengeReducers,
} from './request-with-email-verification-challenge.ts';
import type { UserId } from './values.ts';

//#region CertifiedUserProfileConfigurationMap
export interface CertifiedUserProfileConfigurationMap extends ContextMap {
  readonly 'certifiedUserProfile.expiredAt': number;
  readonly 'userCertification.acceptedEmailAddressRegExp': string;
  readonly 'userCertification.acceptedEmailAddressDescription': I18nMap;
  readonly 'userCertification.recertificatableBeforeMs': number;
  readonly 'userCertification.emailSubjectTemplate': I18nMap;
  readonly 'userCertification.emailBodyTemplate': I18nMap;
  readonly 'userCertification.expiredAfterMs': number;
}

const certifiedUserProfileDefaultConfigurationMap = {
  'userCertification.acceptedEmailAddressRegExp': '^[a-z0-9]{5,8}@example.edu$',
  'userCertification.acceptedEmailAddressDescription': {
    en: 'Only the email address of Example University (ending with `@example.edu`) will be accepted.',
    ja: 'エグザンプル大学の大学メールアドレス（`@example.edu`で終わるもの）のみ入力することができます。',
  },
  'certifiedUserProfile.expiredAt': Date.parse('2026-03-31T23:59:59.999+09:00'),
  'userCertification.recertificatableBeforeMs': 30 * 24 * 60 * 60 * 1000,
  'userCertification.emailSubjectTemplate': {
    en: '[${system.displayName}] Confirm and enter the verification code to complete user certification',
    ja: '【${system.displayName}】確認コードを確認・入力して認証済みユーザプロフィールの作成を完了してください',
  },
  'userCertification.emailBodyTemplate': {
    en: `You are about to get your \${system.displayName} user account certified.
Please enter the following verification code into the \${system.displayName} app to complete certification process.

Verification code: \${emailVerification.verificationCode}

[!] Don't share your verification code with anyone.

* This email is automatically sent from the \${system.displayName} server. You cannot reply to this email.
* In the case that this email is unexpected, please discard this email.
`,
    ja: `\${system.displayName}の認証済みユーザプロフィールを作成しようとしています。
認証済みユーザプロフィールの作成を完了するには、\${system.displayName}の画面に確認コードを入力してください。

確認コード: \${emailVerification.verificationCode}

[!] 確認コードを他人と共有しないでください。

* このメールは\${system.displayName}のサーバから自動的に送信されています。このメールに返信することはできません。
* お心当たりのない場合は、このメールを破棄していただいてかまいません。
`,
  },
  'userCertification.expiredAfterMs': 5 * 60 * 1000,
} as const satisfies CertifiedUserProfileConfigurationMap;
//#endregion

//#region CertifiedUserProfile
const certifiedUserProfileTypeSymbol = Symbol('certifiedUserProfile.type');

/**
 * 認証済みユーザープロフィールを表す。
 */
export type CertifiedUserProfile = {
  readonly [certifiedUserProfileTypeSymbol]: typeof certifiedUserProfileTypeSymbol;
  readonly certifiedUserId: UserId;
  readonly name: Name;
  readonly displayName: DisplayName;
  readonly certifiedAt: Date;
  readonly expiredAt: Date;
  readonly status: 'valid' | 'expired';
};

/**
 * {@linkcode CertifiedUserProfile}の状態を変更するための関数を提供する。
 */
export const CertifiedUserProfileReducers = {
  /**
   * 新しい認証済みユーザプロフィールを作成する。
   */
  create: <
    P extends {
      readonly certifiedUserId: TCertifiedUserId;
      readonly name: TName;
      readonly displayName: TDisplayName;
      readonly expiredAt: TExpiredAt;
    },
    TCertifiedUserId extends UserId,
    TName extends Name,
    TDisplayName extends DisplayName,
    TExpiredAt extends Date,
  >(
    params: P,
  ): CertifiedUserProfile & Pick<P, 'certifiedUserId' | 'name' | 'displayName' | 'expiredAt'> => {
    const certifiedAt = new Date();
    return {
      [certifiedUserProfileTypeSymbol]: certifiedUserProfileTypeSymbol,
      certifiedUserId: params.certifiedUserId,
      name: params.name,
      displayName: params.displayName,
      certifiedAt,
      expiredAt: params.expiredAt,
      status: certifiedAt.getTime() < params.expiredAt.getTime() ? 'valid' : 'expired',
    } as const;
  },

  /**
   * 指定された認証済みユーザプロフィールの名前と表示名を変更する。
   */
  toEdited: <
    S extends CertifiedUserProfile & { readonly status: 'valid' },
    P extends { readonly newName: TName; readonly newDisplayName: TDisplayName },
    TName extends Name,
    TDisplayName extends DisplayName,
  >(
    self: S,
    params: P,
  ): S & { readonly name: TName; readonly displayName: TDisplayName } =>
    ({ ...self, name: params.newName, displayName: params.newDisplayName }) as const,

  /**
   * 指定された認証済みユーザプロフィールの有効期限を延長する。
   */
  toExpirationDateExtended: <
    S extends CertifiedUserProfile,
    P extends { readonly newExpiredAt: TNewExpiredAt },
    TNewExpiredAt extends Date,
  >(
    self: S,
    params: P,
  ): S & { readonly expiredAt: TNewExpiredAt } =>
    ({
      ...self,
      expiredAt: params.newExpiredAt,
      status: Date.now() < params.newExpiredAt.getTime() ? 'valid' : 'expired',
    }) as const,

  isValid: <S extends CertifiedUserProfile>(self: S): self is S & { readonly status: 'valid' } =>
    self.status === 'valid',
};

export interface CertifiedUserProfileRepository {
  getOneByCertifiedUserId<TId extends UserId>(
    this: CertifiedUserProfileRepository,
    certifiedUserId: TId,
  ): Promise<FromRepository<CertifiedUserProfile & { readonly certifiedUserId: TId }> | undefined>;

  createOne(
    this: CertifiedUserProfileRepository,
    certifiedUserProfile: CertifiedUserProfile,
  ): Promise<void>;

  updateOne(
    this: CertifiedUserProfileRepository,
    certifiedUserProfile: FromRepository<CertifiedUserProfile>,
  ): Promise<void>;

  deleteOneById(this: CertifiedUserProfileRepository, certifiedUserId: UserId): Promise<void>;
}
//#endregion

//#region UserCertificationRequest
export const userCertificationRequestTypeSymbol = Symbol('userCertificationRequest.type');

export type UserCertificationRequestId = NominalPrimitive<
  Id,
  typeof userCertificationRequestTypeSymbol
>;

export type UserCertificationRequest = {
  readonly [userCertificationRequestTypeSymbol]: typeof userCertificationRequestTypeSymbol;
  readonly id: UserCertificationRequestId;
  readonly certifiedUserId: UserId;
  readonly name: Name;
  readonly displayName: DisplayName;
  readonly certificationExpiredAt: Date;
} & RequestWithEmailVerificationChallenge;

export const UserCertificationRequestReducers = {
  ...RequestWithEmailVerificationChallengeReducers,

  create: <
    P extends {
      readonly certifiedUserId: TCertifiedUserId;
      readonly name: TName;
      readonly displayName: TDisplayName;
      readonly certificationExpiredAt: TCertificationExpiredAt;
      readonly associatedEmailVerificationChallengeId: TAssociatedEmailVerificationChallengeId;
    },
    TCertifiedUserId extends UserId,
    TName extends Name,
    TDisplayName extends DisplayName,
    TCertificationExpiredAt extends Date,
    TAssociatedEmailVerificationChallengeId extends EmailVerificationChallengeId,
  >(
    params: P,
  ): UserCertificationRequest & { readonly status: 'requested' } & Pick<
      P,
      | 'certifiedUserId'
      | 'name'
      | 'displayName'
      | 'certificationExpiredAt'
      | 'associatedEmailVerificationChallengeId'
    > =>
    ({
      [userCertificationRequestTypeSymbol]: userCertificationRequestTypeSymbol,
      id: generateId() as UserCertificationRequestId,
      certifiedUserId: params.certifiedUserId,
      name: params.name,
      displayName: params.displayName,
      certificationExpiredAt: params.certificationExpiredAt,
      status: 'requested',
      requestedAt: new Date(),
      associatedEmailVerificationChallengeId: params.associatedEmailVerificationChallengeId,
    }) as const,
};

export interface UserCertificationRequestRepository {
  getOneById<TId extends UserCertificationRequestId>(
    this: UserCertificationRequestRepository,
    id: TId,
  ): Promise<FromRepository<UserCertificationRequest & { readonly id: TId }> | undefined>;

  createOne(
    this: UserCertificationRequestRepository,
    userCertificationRequest: UserCertificationRequest,
  ): Promise<void>;

  updateOne(
    this: UserCertificationRequestRepository,
    userCertificationRequest: FromRepository<UserCertificationRequest>,
  ): Promise<void>;

  deleteOneById(
    this: UserCertificationRequestRepository,
    id: UserCertificationRequestId,
  ): Promise<void>;
}
//#endregion

//#region CertifiedUserProfileService
export interface CertifiedUserProfileServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    PreAppliedVerifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyCertifiedUser: PreApplied<
    PreAppliedVerifyCertifiedUser,
    AccessControlServiceDependencies
  >;
  readonly sendEmailVerificationChallenge: PreApplied<
    PreAppliedSend,
    EmailVerificationServiceDependencies
  >;
  readonly answerEmailVerificationChallenge: PreApplied<
    PreAppliedAnswer,
    EmailVerificationServiceDependencies
  >;
  readonly certifiedUserProfileRepository: CertifiedUserProfileRepository;
  readonly userCertificationRequestRepository: UserCertificationRequestRepository;
  readonly membershipRepository: MembershipRepository;
  readonly contextRepository: ContextRepository<
    CertifiedUserProfileConfigurationMap & SystemConfigurationMap
  >;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 自分の認証済みユーザプロフィールを取得する。
 * @throws 自分の認証済みユーザプロフィールが存在しない場合は、{@linkcode Exception}（`certifiedUserProfile.notExists`）を投げる。
 */
export const getMyCertifiedUserProfile = async (
  params: CertifiedUserProfileServiceDependencies,
): Promise<{ readonly certifiedUserProfile: CertifiedUserProfile }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const certifiedUserProfile = await params.certifiedUserProfileRepository.getOneByCertifiedUserId(
    myUserAccount.id,
  );
  if (certifiedUserProfile === undefined) {
    throw Exception.create({ exceptionName: 'certifiedUserProfile.notExists' });
  }

  return { certifiedUserProfile };
};

/**
 * 自分の認証済みユーザプロフィールの名前と表示名を更新する。
 */
export const editMyCertifiedUserProfile = async (
  params: {
    readonly name: Name;
    readonly displayName: DisplayName;
  } & CertifiedUserProfileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const { certifiedUserProfile } = await params.verifyCertifiedUser({ userId: myUserAccount.id });

  const profileEdited = CertifiedUserProfileReducers.toEdited(certifiedUserProfile, {
    newName: params.name,
    newDisplayName: params.displayName,
  });
  await params.certifiedUserProfileRepository.updateOne(profileEdited);
};

/**
 * 認証済みユーザプロフィールの作成を開始する。
 *
 * 入力されたEメールアドレスにEメールアドレス確認の確認コードを送信する。
 * @throws 認証済みユーザプロフィールが作成済みで、有効期限より一定期間以上前の場合は、{@linkcode Exception}（`userCertification.alreadyCertified`）を投げる。
 * @throws 入力されたEメールアドレスが認証済みユーザの要件を満たさない場合は、{@linkcode Exception}（`userCertification.emailAddressRejected`）を投げる。
 */
export const requestUserCertification = async (
  params: {
    readonly emailAddress: EmailAddress;
    readonly name: Name;
    readonly displayName: DisplayName;
  } & CertifiedUserProfileServiceDependencies,
): Promise<{
  readonly id: UserCertificationRequestId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const certifiedUserProfile = await params.certifiedUserProfileRepository.getOneByCertifiedUserId(
    myUserAccount.id,
  );
  if (
    certifiedUserProfile !== undefined &&
    Date.now() <
      certifiedUserProfile.expiredAt.getTime() -
        params.contextRepository.get('userCertification.recertificatableBeforeMs')
  ) {
    throw Exception.create({ exceptionName: 'userCertification.alreadyCertified' });
  }

  if (
    new RegExp(params.contextRepository.get('userCertification.acceptedEmailAddressRegExp')).test(
      params.emailAddress,
    ) === false
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
      i18nMap: params.contextRepository.get('userCertification.emailSubjectTemplate'),
    }),
    emailBodyTemplate: localize({
      acceptedLanguages,
      i18nMap: params.contextRepository.get('userCertification.emailBodyTemplate'),
    }),
    valuesForTemplatePlaceholders: {
      'system.displayName': localize({
        acceptedLanguages,
        i18nMap: params.contextRepository.get('system.displayName'),
      }),
    },
    expiredAfterMs: params.contextRepository.get('userCertification.expiredAfterMs'),
  });

  const request = UserCertificationRequestReducers.create({
    name: params.name,
    displayName: params.displayName,
    certifiedUserId: myUserAccount.id,
    associatedEmailVerificationChallengeId,
    certificationExpiredAt: new Date(
      params.contextRepository.get('certifiedUserProfile.expiredAt'),
    ),
  });
  await params.userCertificationRequestRepository.createOne(request);

  return { id: request.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認の確認コードが正しいのかを確認して、認証済みユーザプロフィールの作成を完了する。
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
  if (
    request === undefined ||
    !UserCertificationRequestReducers.isNotTerminated(request) ||
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

  const profile = await params.certifiedUserProfileRepository.getOneByCertifiedUserId(
    myUserAccount.id,
  );
  if (profile === undefined) {
    const profileCreated = CertifiedUserProfileReducers.create({
      name: request.name,
      displayName: request.displayName,
      certifiedUserId: request.certifiedUserId,
      expiredAt: request.certificationExpiredAt,
    });
    await params.certifiedUserProfileRepository.createOne(profileCreated);
  } else {
    const profileExtended = CertifiedUserProfileReducers.toExpirationDateExtended(profile, {
      newExpiredAt: request.certificationExpiredAt,
    });
    await params.certifiedUserProfileRepository.updateOne(profileExtended);
  }

  const requestCompleted = UserCertificationRequestReducers.toCompleted(request);
  await params.userCertificationRequestRepository.updateOne(requestCompleted);
};

/**
 * 認証済みユーザプロフィールの作成を中止する。
 * @throws 認証済みユーザプロフィールの作成のリクエストが存在しない場合、完了または中止になっている場合、別のユーザのものである場合は、{@linkcode Exception}（`userCertification.notExists`）を投げる。
 */
export const cancelUserCertification = async (
  params: { readonly id: UserCertificationRequestId } & CertifiedUserProfileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  const request = await params.userCertificationRequestRepository.getOneById(params.id);

  if (
    request === undefined ||
    !UserCertificationRequestReducers.isNotTerminated(request) ||
    request.certifiedUserId !== myUserAccount.id
  ) {
    throw Exception.create({ exceptionName: 'userCertification.notExists' });
  }

  const requestCanceled = UserCertificationRequestReducers.toCanceled(request);
  await params.userCertificationRequestRepository.updateOne(requestCanceled);
};

/**
 * 自分の認証済みユーザプロフィールを削除する。
 * @throws グループに1つ以上所属している場合は、{@linkcode Exception}（`userCertification.notLeftAllGroupsYet`）を投げる。
 */
export const deleteMyCertifiedUserProfile = async (
  params: CertifiedUserProfileServiceDependencies,
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

  await params.certifiedUserProfileRepository.deleteOneById(myUserAccount.id);
};
//#endregion
