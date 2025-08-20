import type { Cancel, Enqueue, ExecutionId } from '@mgn901/mgn901-utils-ts/execution-queue';
import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { EmailAddress } from '../values.ts';
import { Exception } from './exception.ts';
import { generateId, type Id } from './random-values/id.ts';
import { generateShortSecret, type ShortSecret } from './random-values/short-secret.ts';
import type { CreateOne, DeleteOneBy, GetOneBy } from './repository.ts';
import { renderTemplate } from './template.ts';

//#region Email
const emailIdSymbol = Symbol('email.id');

export type EmailId = NominalPrimitive<Id, typeof emailIdSymbol>;

export type Email = ReturnType<typeof newEmailFrom>;

export const newEmailFrom = <
  P extends { to: readonly EmailAddress[]; subject: string; body: string },
>(
  params: Readonly<P>,
) =>
  ({
    id: generateId() as EmailId,
    to: params.to,
    subject: params.subject,
    body: params.body,
  }) as const;

export type EmailClient = {
  send(this: unknown, email: Email): Promise<void>;
};
//#endregion

//#region EmailQueue
export type EmailQueue = { readonly enqueue: Enqueue<[email: Email]>; readonly cancel: Cancel };
//#endregion

//#region EmailVerificationChallenge
export const emailVerificationChallengeIdSymbol = Symbol('emailVerificationChallengeBase.id');
export const emailVerificationChallengeCorrectVerificationCodeSymbol = Symbol(
  'emailVerificationChallengeBase.correctVerificationCode',
);
export type EmailVerificationChallengeId = NominalPrimitive<
  Id,
  typeof emailVerificationChallengeIdSymbol
>;
export type EmailVerificationChallengeVerificationCode = NominalPrimitive<
  ShortSecret,
  typeof emailVerificationChallengeIdSymbol
>;

export type EmailVerificationChallenge = ReturnType<typeof newEmailVerificationChallengeFrom>;

export const newEmailVerificationChallengeFrom = <P extends { emailAddress: EmailAddress }>(
  params: Readonly<P>,
) =>
  ({
    type: 'emailVerificationChallenge',
    id: generateId() as EmailVerificationChallengeId,
    emailAddress: params.emailAddress,
    [emailVerificationChallengeCorrectVerificationCodeSymbol]:
      generateShortSecret() as EmailVerificationChallengeVerificationCode,
  }) as const;

export type EmailVerificationChallengeRepository = {
  readonly getOneById: GetOneBy<EmailVerificationChallenge, EmailVerificationChallengeId, 'id'>;
  readonly createOne: CreateOne<EmailVerificationChallenge>;
  readonly deleteOneById: DeleteOneBy<EmailVerificationChallengeId>;
};
//#endregion

//#region EmailVerificationChallengeSentEventData
export type EmailVerificationChallengeSentEventData = ReturnType<
  typeof newEmailVerificationChallengeSentEventDataFrom
>;

export const newEmailVerificationChallengeSentEventDataFrom = <
  P extends {
    emailVerificationChallengeId: EmailVerificationChallengeId;
    sentAt: Date;
    expiredAt: Date;
    associatedExecutionId: ExecutionId;
  },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'emailVerificationChallenge.sent',
    emailVerificationChallengeId: params.emailVerificationChallengeId,
    sentAt: params.sentAt,
    expiredAt: params.expiredAt,
    associatedExecutionId: params.associatedExecutionId,
  }) as const;

export type EmailVerificationChallengeSentEventDataRepository = {
  readonly getOneById: GetOneBy<
    EmailVerificationChallengeSentEventData,
    EmailVerificationChallengeId,
    'emailVerificationChallengeId'
  >;
  readonly createOne: CreateOne<EmailVerificationChallengeSentEventData>;
  readonly deleteOneById: DeleteOneBy<EmailVerificationChallengeId>;
};
//#endregion

//#region EmailVerificationChallengeCompletedEventData
export type EmailVerificationChallengeCompletedEventData = ReturnType<
  typeof newEmailVerificationChallengeCompletedEventDataFrom
>;

export const newEmailVerificationChallengeCompletedEventDataFrom = <
  P extends { emailVerificationChallengeId: EmailVerificationChallengeId; completedAt: Date },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'emailVerificationChallenge.completed',
    emailVerificationChallengeId: params.emailVerificationChallengeId,
    completedAt: params.completedAt,
  }) as const;

export type EmailVerificationChallengeCompletedEventDataRepository = {
  readonly getOneById: GetOneBy<
    EmailVerificationChallengeCompletedEventData,
    EmailVerificationChallengeId,
    'emailVerificationChallengeId'
  >;
  readonly createOne: CreateOne<EmailVerificationChallengeCompletedEventData>;
  readonly deleteOneById: DeleteOneBy<EmailVerificationChallengeId>;
};
//#endregion

//#region EmailVerificationChallengeCanceledEventData
export type EmailVerificationChallengeCanceledEventData = ReturnType<
  typeof newEmailVerificationChallengeCanceledEventDataFrom
>;

export const newEmailVerificationChallengeCanceledEventDataFrom = <
  P extends { emailVerificationChallengeId: EmailVerificationChallengeId; canceledAt: Date },
>(
  params: Readonly<P>,
) =>
  ({
    type: 'emailVerificationChallenge.canceled',
    emailVerificationChallengeId: params.emailVerificationChallengeId,
    canceledAt: params.canceledAt,
  }) as const;

export type EmailVerificationChallengeCanceledEventDataRepository = {
  readonly getOneById: GetOneBy<
    EmailVerificationChallengeCanceledEventData,
    EmailVerificationChallengeId,
    'emailVerificationChallengeId'
  >;
  readonly createOne: CreateOne<EmailVerificationChallengeCanceledEventData>;
  readonly deleteOneById: DeleteOneBy<EmailVerificationChallengeId>;
};
//#endregion

//#region EmailVerificationService
export type EmailVerificationServiceDependencies = {
  readonly emailQueue: EmailQueue;
  readonly emailVerificationChallengeRepository: EmailVerificationChallengeRepository;
  readonly emailVerificationChallengeSentEventDataRepository: EmailVerificationChallengeSentEventDataRepository;
  readonly emailVerificationChallengeCompletedEventDataRepository: EmailVerificationChallengeCompletedEventDataRepository;
  readonly emailVerificationChallengeCanceledEventDataRepository: EmailVerificationChallengeCanceledEventDataRepository;
};

/**
 * Eメールアドレス確認を送信する。
 * Eメールアドレス確認を作成し、その確認コードが含まれるEメールを送信する。
 * @returns Eメールアドレス確認のID、送信日時、確認期限を返す。
 */
export const sendEmailVerificationChallenge = async (
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
  const challenge = newEmailVerificationChallengeFrom({
    emailAddress: params.emailAddress,
  });
  await params.emailVerificationChallengeRepository.createOne(challenge);

  const valuesForTemplatePlaceholdersModified = {
    ...params.valuesForTemplatePlaceholders,
    'emailVerification.emailAddress': params.emailAddress,
    'emailVerification.verificationCode':
      challenge[emailVerificationChallengeCorrectVerificationCodeSymbol],
  };
  const emailSubject = renderTemplate({
    template: params.emailSubjectTemplate,
    values: valuesForTemplatePlaceholdersModified,
  });
  const emailBody = renderTemplate({
    template: params.emailBodyTemplate,
    values: valuesForTemplatePlaceholdersModified,
  });
  const email = newEmailFrom({ to: [params.emailAddress], subject: emailSubject, body: emailBody });

  const { executionId: associatedExecutionId, executedAt: sentAt } =
    await params.emailQueue.enqueue(email);

  const expiredAt = new Date(sentAt.getTime() + params.expiredAfterMs);
  await params.emailVerificationChallengeSentEventDataRepository.createOne(
    newEmailVerificationChallengeSentEventDataFrom({
      emailVerificationChallengeId: challenge.id,
      sentAt,
      expiredAt,
      associatedExecutionId,
    }),
  );

  return { id: challenge.id, sentAt, expiredAt };
};

export type SendEmailVerificationChallenge = (
  params: Omit<
    Parameters<typeof sendEmailVerificationChallenge>[0],
    keyof EmailVerificationServiceDependencies
  >,
) => ReturnType<typeof sendEmailVerificationChallenge>;

/**
 * Eメールアドレス確認に回答する。
 * @returns 確認コードが正しいかどうかを返す。認証の期限を超過している場合も`{ isCorrect: false }`を返す。
 * @throws 指定されたIDのEメールアドレス確認が存在しない場合は{@linkcode Exception}（`emailVerification.notExists`）を投げる。
 */
export const answerEmailVerificationChallenge = async (
  params: {
    readonly id: EmailVerificationChallengeId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & EmailVerificationServiceDependencies,
): Promise<{ readonly isCorrect: boolean }> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);
  const sentEventData = await params.emailVerificationChallengeSentEventDataRepository.getOneById(
    params.id,
  );
  const isCompleted =
    (await params.emailVerificationChallengeCompletedEventDataRepository.getOneById(params.id)) ??
    false;
  const isCanceled =
    (await params.emailVerificationChallengeCanceledEventDataRepository.getOneById(params.id)) ??
    false;
  const now = new Date();

  if (challenge === undefined || sentEventData === undefined || isCompleted || isCanceled) {
    throw Exception.create({ exceptionName: 'emailVerification.notExists' });
  }

  if (
    params.enteredVerificationCode !==
      challenge[emailVerificationChallengeCorrectVerificationCodeSymbol] ||
    sentEventData.expiredAt < now
  ) {
    return { isCorrect: false };
  }

  await params.emailVerificationChallengeCompletedEventDataRepository.createOne(
    newEmailVerificationChallengeCompletedEventDataFrom({
      emailVerificationChallengeId: challenge.id,
      completedAt: now,
    }),
  );

  return { isCorrect: true };
};

export type AnswerEmailVerificationChallenge = (
  params: Omit<
    Parameters<typeof answerEmailVerificationChallenge>[0],
    keyof EmailVerificationServiceDependencies
  >,
) => ReturnType<typeof answerEmailVerificationChallenge>;

/**
 * Eメールアドレス確認を中止する。
 * @throws 指定されたIDのEメールアドレス確認が存在しない場合は{@linkcode Exception}（`emailVerification.notExists`）を投げる。
 */
export const cancelEmailVerificationChallenge = async (
  params: { readonly id: EmailVerificationChallengeId } & EmailVerificationServiceDependencies,
): Promise<void> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);
  const sentEventData = await params.emailVerificationChallengeSentEventDataRepository.getOneById(
    params.id,
  );
  const isCompleted =
    (await params.emailVerificationChallengeCompletedEventDataRepository.getOneById(params.id)) ??
    false;
  const isCanceled =
    (await params.emailVerificationChallengeCanceledEventDataRepository.getOneById(params.id)) ??
    false;

  if (challenge === undefined || sentEventData === undefined || isCompleted || isCanceled) {
    throw Exception.create({ exceptionName: 'emailVerification.notExists' });
  }

  await params.emailQueue.cancel(sentEventData.associatedExecutionId);

  await params.emailVerificationChallengeCanceledEventDataRepository.createOne(
    newEmailVerificationChallengeCanceledEventDataFrom({
      emailVerificationChallengeId: challenge.id,
      canceledAt: new Date(),
    }),
  );
};

export type CancelEmailVerificationChallenge = (
  params: Omit<
    Parameters<typeof cancelEmailVerificationChallenge>[0],
    keyof EmailVerificationServiceDependencies
  >,
) => ReturnType<typeof cancelEmailVerificationChallenge>;
//#endregion
