import type { EmailVerificationChallengeId } from '../../lib/email-verification.ts';

export type RequestWithEmailVerificationChallenge = {
  readonly status: 'requested' | 'completed' | 'canceled';
  readonly requestedAt: Date;
  readonly associatedEmailVerificationChallengeId: EmailVerificationChallengeId;
};

export const RequestWithEmailVerificationChallengeReducers = {
  /**
   * 指定されたリクエストを完了にして返す。
   * @param self 完了にするリクエスト
   */
  toCompleted: <S extends RequestWithEmailVerificationChallenge & { readonly status: 'requested' }>(
    self: S,
  ): S & { readonly status: 'completed' } => ({ ...self, status: 'completed' }) as const,

  /**
   * 指定されたリクエストを中止にして返す。
   * @param self 中止にするリクエスト
   */
  toCanceled: <S extends RequestWithEmailVerificationChallenge & { readonly status: 'requested' }>(
    self: S,
  ): S & { readonly status: 'canceled' } => ({ ...self, status: 'canceled' }) as const,

  isNotTerminated: <S extends RequestWithEmailVerificationChallenge>(
    self: S,
  ): self is S & { readonly status: Exclude<S['status'], 'completed' | 'canceled'> } =>
    self.status !== 'completed' && self.status !== 'canceled',
};
