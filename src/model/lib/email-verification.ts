import type { Cancel, Enqueue, ExecutionId } from '@mgn901/mgn901-utils-ts/execution-queue';
import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { Filters, FromRepository } from '@mgn901/mgn901-utils-ts/repository-utils';
import type { EmailAddress } from '../values.ts';
import { Exception } from './exception.ts';
import { generateId, type Id } from './random-values/id.ts';
import { generateShortSecret, type ShortSecret } from './random-values/short-secret.ts';
import { renderTemplate } from './template.ts';

//#region Email and EmailClient
const emailTypeSymbol = Symbol('email.type');

/** Eメールを表す。 */
export interface Email {
  readonly id: NominalPrimitive<Id, typeof emailTypeSymbol>;
  readonly to: readonly EmailAddress[];
  readonly subject: string;
  readonly body: string;
}

/** {@linkcode Email}の状態を変更するための関数を提供する。 */
export const EmailReducers = {
  /** 新しいEメールを作成して返す。 */
  create: (params: Pick<Email, 'to' | 'subject' | 'body'>): Email => ({
    id: generateId() as Email['id'],
    to: params.to,
    subject: params.subject,
    body: params.body,
  }),
};

/** Eメールクライアント。 */
export type EmailClient = {
  /** 指定されたEメールを送信する。 */
  send(this: unknown, email: Email): Promise<void>;
};
//#endregion

//#region EmailQueue
export type EmailQueue = { readonly enqueue: Enqueue<[email: Email]>; readonly cancel: Cancel };
//#endregion

//#region EmailVerificationChallenge and EmailVerificationChallengeRepository
const emailVerificationChallengeTypeSymbol = Symbol('emailVerificationChallengeBase.type');

const correctVerificationCodeSymbol = Symbol(
  'emailVerificationChallengeBase.correctVerificationCode',
);

export const emailVerificationChallengeSymbol = {
  type: emailVerificationChallengeTypeSymbol,
  correctVerificationCode: correctVerificationCodeSymbol,
} as const;

export type EmailVerificationChallengeId = NominalPrimitive<
  Id,
  typeof emailVerificationChallengeTypeSymbol
>;

export type EmailVerificationChallengeVerificationCode = NominalPrimitive<
  ShortSecret,
  typeof emailVerificationChallengeTypeSymbol
>;

/** Eメールアドレス確認を表す。 */
export type EmailVerificationChallenge =
  | EmailVerificationChallengePrepared
  | EmailVerificationChallengeSent;

type EmailVerificationChallengeBase = {
  readonly [emailVerificationChallengeTypeSymbol]: typeof emailVerificationChallengeTypeSymbol;
  readonly id: EmailVerificationChallengeId;
  readonly emailAddress: EmailAddress;
  readonly [correctVerificationCodeSymbol]: EmailVerificationChallengeVerificationCode;
  readonly status: 'prepared' | 'sent' | 'completed' | 'canceled';
};

/** 送信準備が完了して、まだ送信はされていないEメールアドレス確認を表す。 */
export type EmailVerificationChallengePrepared = EmailVerificationChallengeBase & {
  readonly status: 'prepared';
};

/** 送信後のEメールアドレス確認を表す。 */
export type EmailVerificationChallengeSent = EmailVerificationChallengeBase & {
  readonly status: 'sent' | 'completed' | 'canceled';
  readonly sentAt: Date;
  readonly expiredAt: Date;
  readonly associatedExecutionId: ExecutionId;
};

/** {@linkcode EmailVerificationChallenge}の状態を変更するための関数を提供する。 */
export const EmailVerificationChallengeReducers = {
  /** 新しいEメールアドレス確認を作成する。 */
  create: <P extends { readonly emailAddress: TEmailAddress }, TEmailAddress extends EmailAddress>(
    params: P,
  ): EmailVerificationChallengePrepared & Pick<P, 'emailAddress'> =>
    ({
      [emailVerificationChallengeTypeSymbol]: emailVerificationChallengeTypeSymbol,
      id: generateId() as EmailVerificationChallengeId,
      [correctVerificationCodeSymbol]:
        generateShortSecret() as EmailVerificationChallengeVerificationCode,
      emailAddress: params.emailAddress,
      status: 'prepared',
    }) as const,

  /** 関連する{@linkcode EmailQueueExecutionId}と確認期限を設定して{@linkcode EmailVerificationChallengeSent}にしたものを返す。 */
  toSent: <
    S extends EmailVerificationChallengePrepared & { readonly status: 'prepared' },
    P extends {
      readonly associatedExecutionId: TAssociatedExecutionId;
      readonly sentAt: TSentAt;
      /** 確認コードの回答期限を指定する。 */
      readonly expiredAt: TNewExpiredAt;
    },
    TAssociatedExecutionId extends ExecutionId,
    TSentAt extends Date,
    TNewExpiredAt extends Date,
  >(
    self: S,
    params: P,
  ): Omit<S, 'status'> &
    EmailVerificationChallengeSent & { readonly status: 'sent' } & Pick<
      P,
      'sentAt' | 'expiredAt' | 'associatedExecutionId'
    > =>
    ({
      ...self,
      status: 'sent',
      associatedExecutionId: params.associatedExecutionId,
      sentAt: params.sentAt,
      expiredAt: params.expiredAt,
    }) as const,

  /**
   * 指定されたEメールアドレス確認に回答して、その結果を返す。
   * - 確認コードが間違っている場合は不正解になる。
   * - 確認コードが正しい場合は正解になり、Eメールアドレス確認が完了になる。
   * @returns 確認コードが正しいかどうかと、確認の結果更新されたこのオブジェクトのコピーを返す。
   */
  answer: <S extends EmailVerificationChallengeSent & { readonly status: 'sent' }>(
    self: S,
    params: { readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode },
  ):
    | { readonly isCorrect: false; readonly updatedEmailVerificationChallenge: S }
    | {
        readonly isCorrect: true;
        readonly updatedEmailVerificationChallenge: S & { readonly status: 'completed' };
      } => {
    if (params.enteredVerificationCode !== self[correctVerificationCodeSymbol]) {
      return { isCorrect: false, updatedEmailVerificationChallenge: self } as const;
    }

    return {
      isCorrect: true,
      updatedEmailVerificationChallenge: { ...self, status: 'completed' } as const,
    } as const;
  },

  /** 指定されたEメールアドレス確認を中止にしたものを返す。 */
  toCanceled: <S extends EmailVerificationChallengeSent & { readonly status: 'sent' }>(
    self: S,
  ): S & { readonly status: 'canceled' } => ({ ...self, status: 'canceled' }) as const,

  isSent: <S extends EmailVerificationChallenge>(
    self: S,
  ): self is S & EmailVerificationChallengeSent => self.status !== 'prepared',

  isNotTerminated: <S extends EmailVerificationChallenge>(
    self: S,
  ): self is S & { readonly status: Exclude<S['status'], 'completed' | 'canceled'> } =>
    self.status !== 'completed' && self.status !== 'canceled',
};

/** {@linkcode EmailVerificationChallenge}を永続化するリポジトリ。 */
export interface EmailVerificationChallengeRepository {
  getOneById<TId extends EmailVerificationChallengeId>(
    this: EmailVerificationChallengeRepository,
    id: TId,
  ): Promise<FromRepository<EmailVerificationChallenge & { readonly id: TId }> | undefined>;

  count(
    this: EmailVerificationChallengeRepository,
    params: { readonly filters?: Filters<EmailVerificationChallenge> },
  ): Promise<number>;

  createOne(
    this: EmailVerificationChallengeRepository,
    emailVerificationChallenge: EmailVerificationChallenge,
  ): Promise<void>;

  updateOne(
    this: EmailVerificationChallengeRepository,
    emailVerificationChallenge: EmailVerificationChallenge,
  ): Promise<void>;

  deleteOneById(
    this: EmailVerificationChallengeRepository,
    id: EmailVerificationChallengeId,
  ): Promise<void>;
}
//#endregion

//#region EmailVerificationService
export interface EmailVerificationServiceDependencies {
  readonly emailQueue: EmailQueue;
  readonly emailVerificationChallengeRepository: EmailVerificationChallengeRepository;
}

/**
 * Eメールアドレス確認を送信する。
 * Eメールアドレス確認を作成し、その確認コードが含まれるEメールを送信する。
 * @returns Eメールアドレス確認のID、送信日時、確認期限を返す。
 */
export const send = async (
  params: {
    readonly emailAddress: EmailAddress;
    readonly emailSubjectTemplate: string;
    readonly emailBodyTemplate: string;
    readonly expiredAfterMs: number;
    readonly valuesForTemplatePlaceholders: { readonly [k in string]: string };
  } & EmailVerificationServiceDependencies,
): Promise<{
  readonly id: EmailVerificationChallengeId;
  readonly sentAt: Date;
  readonly expiredAt: Date;
}> => {
  const challenge = EmailVerificationChallengeReducers.create({
    emailAddress: params.emailAddress,
  });

  const valuesForTemplatePlaceholdersModified = {
    ...params.valuesForTemplatePlaceholders,
    'emailVerification.emailAddress': params.emailAddress,
    'emailVerification.verificationCode': challenge[correctVerificationCodeSymbol],
  };
  const emailSubject = renderTemplate({
    template: params.emailSubjectTemplate,
    values: valuesForTemplatePlaceholdersModified,
  });
  const emailBody = renderTemplate({
    template: params.emailBodyTemplate,
    values: valuesForTemplatePlaceholdersModified,
  });

  const execution = await params.emailQueue.enqueue(
    EmailReducers.create({ to: [params.emailAddress], subject: emailSubject, body: emailBody }),
  );

  const sentAt = execution.executedAt;
  const expiredAt = new Date(sentAt.getTime() + params.expiredAfterMs);

  const challengeSent = EmailVerificationChallengeReducers.toSent(challenge, {
    associatedExecutionId: execution.executionId,
    sentAt,
    expiredAt,
  });

  await params.emailVerificationChallengeRepository.createOne(challengeSent);

  return { id: challengeSent.id, sentAt, expiredAt };
};

export type PreAppliedSend = (
  params: Omit<Parameters<typeof send>[0], keyof EmailVerificationServiceDependencies>,
) => ReturnType<typeof send>;

/**
 * Eメールアドレス確認に回答する。
 * @returns 確認コードが正しいかどうかを返す。
 */
export const answer = async (
  params: {
    readonly id: EmailVerificationChallengeId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & EmailVerificationServiceDependencies,
): Promise<{ readonly isCorrect: boolean }> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);

  if (
    challenge === undefined ||
    !EmailVerificationChallengeReducers.isSent(challenge) ||
    !EmailVerificationChallengeReducers.isNotTerminated(challenge)
  ) {
    throw Exception.create({ exceptionName: 'emailVerification.notExists' });
  }

  const result = EmailVerificationChallengeReducers.answer(challenge, {
    enteredVerificationCode: params.enteredVerificationCode,
  });
  await params.emailVerificationChallengeRepository.updateOne(
    result.updatedEmailVerificationChallenge,
  );

  return { isCorrect: result.isCorrect };
};

export type PreAppliedAnswer = (
  params: Omit<Parameters<typeof answer>[0], keyof EmailVerificationServiceDependencies>,
) => ReturnType<typeof answer>;

/**
 * Eメールアドレス確認を中止する。
 */
export const cancel = async (
  params: { readonly id: EmailVerificationChallengeId } & EmailVerificationServiceDependencies,
): Promise<void> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);
  if (
    challenge === undefined ||
    !EmailVerificationChallengeReducers.isSent(challenge) ||
    !EmailVerificationChallengeReducers.isNotTerminated(challenge)
  ) {
    throw Exception.create({ exceptionName: 'emailVerification.notExists' });
  }

  await params.emailQueue.cancel(challenge.associatedExecutionId);

  const challengeCanceled = EmailVerificationChallengeReducers.toCanceled(challenge);
  await params.emailVerificationChallengeRepository.updateOne(challengeCanceled);
};
//#endregion

export type PreAppliedCancel = (
  params: Omit<Parameters<typeof cancel>[0], keyof EmailVerificationServiceDependencies>,
) => ReturnType<typeof cancel>;
