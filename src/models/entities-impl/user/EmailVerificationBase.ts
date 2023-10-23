import { IEmailVerification } from '../../entities/user/IEmailVerification.ts';
import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';

/**
 * {@linkcode IEmailVerification}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class EmailVerificationBase<F extends TEmailVerificationPurpose>
  implements IEmailVerification<F>
{
  public readonly __brand = 'IEmailVerification';

  public readonly id: IEmailVerification<F>['id'];

  public readonly createdAt: IEmailVerification<F>['createdAt'];

  public readonly expiresAt: IEmailVerification<F>['expiresAt'];

  public readonly for: IEmailVerification<F>['for'];

  public readonly email: IEmailVerification<F>['email'];

  public readonly userId: IEmailVerification<F>['userId'];

  private readonly _secret: TShortSecret;

  public constructor(
    emailVerification: Pick<
      IEmailVerification<F>,
      'id' | 'createdAt' | 'expiresAt' | 'for' | 'email' | 'userId'
    > & { _secret: TShortSecret },
  ) {
    this.id = emailVerification.id;
    this.createdAt = emailVerification.createdAt;
    this.expiresAt = emailVerification.expiresAt;
    this.for = emailVerification.for;
    this.email = emailVerification.email;
    this.userId = emailVerification.userId;
    this._secret = emailVerification._secret;
  }

  public check(answer: TShortSecret): boolean {
    return answer === this.dangerouslyGetSecret();
  }

  public isValidAt(date: Date): boolean {
    return date < this.expiresAt;
  }

  public dangerouslyGetSecret(): TShortSecret {
    return this._secret;
  }
}
