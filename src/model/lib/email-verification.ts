import type { ExecutionQueue } from '../../utils/execution-queue.ts';
import type { ArrowFunction, NominalPrimitive } from '../../utils/type-utils.ts';
import type { EmailAddress } from '../values.ts';
import { type Id, generateId } from './random-values/id.ts';
import { type ShortSecret, generateShortSecret } from './random-values/short-secret.ts';
import { renderTemplate } from './template.ts';
import type { FieldsOf, PickEssential, TypedInstance } from './type-utils.ts';

//#region Email and EmailClient
const emailTypeSymbol = Symbol();

export class Email {
  public readonly id: NominalPrimitive<Id, typeof emailTypeSymbol>;
  public readonly to: readonly EmailAddress[];
  public readonly subject: string;
  public readonly body: string;

  public static create(this: unknown, params: Pick<Email, 'to' | 'subject' | 'body'>): Email {
    return Email.from({ ...params, id: generateId() as Email['id'] });
  }

  public static from(this: unknown, params: FieldsOf<Email>): Email {
    return new Email(params);
  }

  private constructor(params: FieldsOf<Email>) {
    this.id = params.id;
    this.to = params.to;
    this.subject = params.subject;
    this.body = params.body;
  }
}

export interface EmailClient {
  send(this: EmailClient, email: Email): Promise<void>;
}
//#endregion

//#region EmailQueue
const emailQueueExecutionTypeSymbol = Symbol();

export type EmailQueueExecutionId = NominalPrimitive<Id, typeof emailQueueExecutionTypeSymbol>;

export type EmailQueue = ExecutionQueue<
  EmailQueueExecutionId,
  ArrowFunction<EmailClient['send']>,
  void
>;
//#endregion

//#region EmailVerificationChallenge and EmailVerificationChallengeRepository
const typeSymbol = Symbol();

const correctVerificationCodeSymbol = Symbol();

export const emailVerificationChallengeSymbol = {
  type: typeSymbol,
  correctVerificationCode: correctVerificationCodeSymbol,
} as const;

export type EmailVerificationChallengeId = NominalPrimitive<Id, typeof typeSymbol>;

export type EmailVerificationChallengeVerificationCode = NominalPrimitive<
  ShortSecret,
  typeof typeSymbol
>;

abstract class EmailVerificationChallengeBase {
  public readonly id: EmailVerificationChallengeId;
  public readonly emailAddress: EmailAddress;
  public readonly [correctVerificationCodeSymbol]: EmailVerificationChallengeVerificationCode;

  //#region constructors
  public constructor(params: FieldsOf<EmailVerificationChallengeBase>) {
    this.id = params.id;
    this.emailAddress = params.emailAddress;
    this[correctVerificationCodeSymbol] = params[correctVerificationCodeSymbol];
  }
  //#endregion
}

/** 送信前のEメールアドレス確認を表す。 */
export class EmailVerificationChallengePrepared extends EmailVerificationChallengeBase {
  public readonly preparedAt: Date;

  /** 新しいEメールアドレス確認を作成する。 */
  public static create<
    P extends { readonly emailAddress: TEmailAddress },
    TEmailAddress extends EmailAddress,
  >(this: unknown, params: P): EmailVerificationChallengePrepared {
    return EmailVerificationChallengePrepared.from({
      id: generateId() as EmailVerificationChallengeId,
      emailAddress: params.emailAddress,
      [correctVerificationCodeSymbol]:
        generateShortSecret() as EmailVerificationChallengeVerificationCode,
      preparedAt: new Date(),
    });
  }

  /** 関連する{@linkcode EmailQueueExecutionId}と確認期限を設定して{@linkcode EmailVerificationChallengeSent}にする。 */
  public toSent<
    P extends {
      readonly associatedExecutionId: TAssociatedExecutionId;
      readonly sentAt: TSentAt;
      readonly expiredAt: TNewExpiredAt;
    },
    T extends EmailVerificationChallengePrepared,
    TAssociatedExecutionId extends EmailQueueExecutionId,
    TSentAt extends Date = Date,
    TNewExpiredAt extends Date = Date,
  >(this: T, params: P): TypedInstance<EmailVerificationChallengeSent, T & P> {
    return EmailVerificationChallengeSent.from({ ...this, ...params });
  }

  //#region constructors
  public static from<P extends FieldsOf<EmailVerificationChallengePrepared>>(
    this: unknown,
    params: PickEssential<P, keyof FieldsOf<EmailVerificationChallengePrepared>>,
  ): TypedInstance<EmailVerificationChallengePrepared, P> {
    return new EmailVerificationChallengePrepared(params) as TypedInstance<
      EmailVerificationChallengePrepared,
      P
    >;
  }

  private constructor(params: FieldsOf<EmailVerificationChallengePrepared>) {
    super(params);
    this.preparedAt = params.preparedAt;
  }
  //#endregion
}

/** 送信後のEメールアドレス確認を表す。 */
export class EmailVerificationChallengeSent extends EmailVerificationChallengeBase {
  public readonly associatedExecutionId: EmailQueueExecutionId;
  public readonly preparedAt: Date;
  public readonly sentAt: Date;
  public readonly expiredAt: Date;

  /**
   * Eメールアドレス確認に回答する。
   * 期限が切れている場合はEメールアドレス確認が中止になる。
   * 確認コードが間違っている場合は不正解になる。
   * 期限が切れておらず、確認コードも正しい場合は正解になり、Eメールアドレス確認が完了になる。
   */
  public answer<T extends EmailVerificationChallengeSent>(
    this: T,
    params: { readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode },
  ):
    | {
        readonly isCorrect: false;
        readonly updatedEmailVerificationChallenge: TypedInstance<
          EmailVerificationChallengeTerminated,
          T & { readonly status: 'expired' }
        >;
      }
    | { readonly isCorrect: false; readonly updatedEmailVerificationChallenge: T }
    | {
        readonly isCorrect: true;
        readonly updatedEmailVerificationChallenge: TypedInstance<
          EmailVerificationChallengeTerminated,
          T & { readonly status: 'completed' }
        >;
      } {
    if (this.expiredAt.getTime() < Date.now()) {
      return {
        isCorrect: false,
        updatedEmailVerificationChallenge: EmailVerificationChallengeTerminated.from({
          ...this,
          status: 'expired',
        }),
      };
    }

    if (params.enteredVerificationCode !== this[correctVerificationCodeSymbol]) {
      return { isCorrect: false, updatedEmailVerificationChallenge: this };
    }

    return {
      isCorrect: true,
      updatedEmailVerificationChallenge: EmailVerificationChallengeTerminated.from({
        ...this,
        status: 'completed',
      }),
    };
  }

  /** Eメールアドレス確認を中止にする。 */
  public toCanceled<T extends EmailVerificationChallengeSent>(
    this: T,
  ): TypedInstance<EmailVerificationChallengeTerminated, T & { readonly status: 'canceled' }> {
    return EmailVerificationChallengeTerminated.from({ ...this, status: 'canceled' });
  }

  //#region constructors
  public static from<P extends FieldsOf<EmailVerificationChallengeSent>>(
    this: unknown,
    params: PickEssential<P, keyof FieldsOf<EmailVerificationChallengeSent>>,
  ): TypedInstance<EmailVerificationChallengeSent, P> {
    return new EmailVerificationChallengeSent(params) as TypedInstance<
      EmailVerificationChallengeSent,
      P
    >;
  }

  private constructor(params: FieldsOf<EmailVerificationChallengeSent>) {
    super(params);
    this.associatedExecutionId = params.associatedExecutionId;
    this.preparedAt = params.preparedAt;
    this.sentAt = params.sentAt;
    this.expiredAt = params.expiredAt;
  }
  //#endregion
}

/** 終了後のEメールアドレス確認を表す。 */
export class EmailVerificationChallengeTerminated extends EmailVerificationChallengeBase {
  public readonly status: 'completed' | 'canceled' | 'expired';
  public readonly preparedAt: Date;
  public readonly sentAt: Date;
  public readonly expiredAt: Date;

  //#region constructors
  public static from<P extends FieldsOf<EmailVerificationChallengeTerminated>>(
    this: unknown,
    params: PickEssential<P, keyof FieldsOf<EmailVerificationChallengeTerminated>>,
  ): TypedInstance<EmailVerificationChallengeTerminated, P> {
    return new EmailVerificationChallengeTerminated(params) as TypedInstance<
      EmailVerificationChallengeTerminated,
      P
    >;
  }

  private constructor(params: FieldsOf<EmailVerificationChallengeTerminated>) {
    super(params);
    this.status = params.status;
    this.preparedAt = params.preparedAt;
    this.sentAt = params.sentAt;
    this.expiredAt = params.expiredAt;
  }
  //#endregion
}

/** Eメールアドレス確認を表す。 */
export type EmailVerificationChallenge =
  | EmailVerificationChallengePrepared
  | EmailVerificationChallengeSent
  | EmailVerificationChallengeTerminated
  | EmailVerificationChallengeTerminated;

export interface EmailVerificationChallengeRepository {
  getOneById<TId extends EmailVerificationChallengeId>(
    this: EmailVerificationChallengeRepository,
    id: TId,
  ): Promise<(EmailVerificationChallenge & { readonly id: TId }) | undefined>;

  // getMany<TEmailAddress extends EmailAddress>(
  //   this: EmailVerificationChallengeRepository,
  //   params: {
  //     readonly filters?:
  //       | {
  //           readonly emailAddress?: TEmailAddress | undefined;
  //           readonly preparedAt?:
  //             | { readonly from?: Date | undefined; readonly until?: Date | undefined }
  //             | undefined;
  //           readonly sentAt?:
  //             | { readonly from?: Date | undefined; readonly until?: Date | undefined }
  //             | undefined;
  //           readonly expiredAt?:
  //             | { readonly from?: Date | undefined; readonly until?: Date | undefined }
  //             | undefined;
  //           readonly status?: 'completed' | 'canceled' | 'expired' | undefined;
  //         }
  //       | undefined;
  //     readonly orderBy:
  //       | { readonly id: 'asc' | 'desc' }
  //       | { readonly emailAddress: 'asc' | 'desc' }
  //       | { readonly associatedExecutionId: 'asc' | 'desc' }
  //       | { readonly preparedAt: 'asc' | 'desc' }
  //       | { readonly sentAt: 'asc' | 'desc' }
  //       | { readonly expiredAt: 'asc' | 'desc' };
  //     readonly offset?: number | undefined;
  //     readonly limit?: number | undefined;
  //   },
  // ): Promise<readonly EmailVerificationChallenge[] | readonly []>;

  count<TEmailAddress extends EmailAddress>(
    this: EmailVerificationChallengeRepository,
    params: {
      readonly filters?:
        | {
            readonly emailAddress?: TEmailAddress | undefined;
            readonly preparedAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly sentAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly expiredAt?:
              | { readonly from?: Date | undefined; readonly until?: Date | undefined }
              | undefined;
            readonly status?: 'completed' | 'canceled' | 'expired' | undefined;
          }
        | undefined;
    },
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
 * Eメールアドレス確認を作成・リポジトリに保存し、その確認コードが含まれるEメールを送信する。
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
  const challenge = EmailVerificationChallengePrepared.create({
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

  const execution = await params.emailQueue.enqueue([
    Email.create({ to: [params.emailAddress], subject: emailSubject, body: emailBody }),
  ]);

  const sentAt = execution.executedAt;
  const expiredAt = new Date(sentAt.getTime() + params.expiredAfterMs);

  const challengeSent = challenge.toSent({
    associatedExecutionId: execution.id,
    sentAt,
    expiredAt,
  });

  await params.emailVerificationChallengeRepository.updateOne(challengeSent);

  return { id: challengeSent.id, sentAt, expiredAt };
};

/**
 * Eメールアドレス確認に回答する。
 */
export const answer = async (
  params: {
    readonly id: EmailVerificationChallengeId;
    readonly enteredVerificationCode: EmailVerificationChallengeVerificationCode;
  } & EmailVerificationServiceDependencies,
): Promise<{ readonly isCorrect: boolean }> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);
  if (challenge instanceof EmailVerificationChallengeSent === false) {
    return { isCorrect: false };
  }

  const result = challenge.answer({ enteredVerificationCode: params.enteredVerificationCode });
  await params.emailVerificationChallengeRepository.updateOne(
    result.updatedEmailVerificationChallenge,
  );

  return { isCorrect: result.isCorrect };
};

/**
 * Eメールアドレス確認を中止する。
 */
export const cancel = async (
  params: { readonly id: EmailVerificationChallengeId } & EmailVerificationServiceDependencies,
): Promise<void> => {
  const challenge = await params.emailVerificationChallengeRepository.getOneById(params.id);
  if (challenge instanceof EmailVerificationChallengeSent === false) {
    return;
  }

  await params.emailQueue.cancel(challenge.associatedExecutionId);

  const challengeCanceled = challenge.toCanceled();
  await params.emailVerificationChallengeRepository.updateOne(challengeCanceled);
};
//#endregion
