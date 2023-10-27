import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidEmailVerificationAnswerContext } from '../../contexts/IValidEmailVerificationAnswerContext.ts';
import { IAuthenticationToken } from '../../entities/user/IAuthenticationToken.ts';
import { IEmailVerification } from '../../entities/user/IEmailVerification.ts';
import { IEmailVerificationAnswer } from '../../entities/user/IEmailVerificationAnswer.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { EmailVerificationExpiredException } from '../../errors/EmailVerificationExpiredException.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';
import { InvalidEmailVerificationAnswerException } from '../../errors/InvalidEmailVerificationAnswerException.ts';
import { TooManyRequestsException } from '../../errors/TooManyRequestsException.ts';
import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';
import { generateId } from '../../values/TId.ts';
import { generateLongSecret } from '../../values/TLongSecret.ts';
import { generateShortSecret } from '../../values/TShortSecret.ts';
import { AuthenticationTokenBase } from './AuthenticationTokenBase.ts';
import { EmailVerificationBase } from './EmailVerificationBase.ts';

/**
 * このファイルで用いるための{@linkcode AuthenticationTokenBase}の具象クラス。
 */
class AuthenticationToken extends AuthenticationTokenBase {
  public constructor(
    authenticationToken: Pick<
      IAuthenticationToken,
      'type' | 'expiresAt' | 'ipAddress' | 'userAgent' | 'ownerId'
    >,
  ) {
    const now = new Date();
    super({
      id: generateId(),
      type: authenticationToken.type,
      createdAt: now,
      expiresAt: authenticationToken.expiresAt,
      ipAddress: authenticationToken.ipAddress,
      userAgent: authenticationToken.userAgent,
      ownerId: authenticationToken.ownerId,
      _secret: generateLongSecret(),
    });
  }
}

/**
 * このファイルで用いるための{@linkcode EmailVerificationBase}の具象クラス。
 */
class EmailVerification<F extends TEmailVerificationPurpose> extends EmailVerificationBase<F> {
  public constructor(emailVerification: Pick<IEmailVerification<F>, 'email' | 'for' | 'userId'>) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    super({
      id: generateId(),
      createdAt: now,
      expiresAt,
      for: emailVerification.for,
      email: emailVerification.email,
      userId: emailVerification.userId,
      _secret: generateShortSecret(),
    });
  }
}

/**
 * {@linkcode IUser}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class UserBase implements IUser {
  public readonly __brand = 'IUser';

  public readonly id: IUser['id'];

  private _email: IUser['email'];

  private _registeredAt: IUser['registeredAt'];

  private readonly _tokens: IUser['tokens'];

  private readonly _emailVerifications: ArrayWithDiff<
    IEmailVerification<TEmailVerificationPurpose>
  >;

  public constructor(
    user: Pick<IUser, 'id' | 'email' | 'registeredAt' | 'tokens'> & {
      _emailVerifications: ArrayWithDiff<IEmailVerification<TEmailVerificationPurpose>>;
    },
  ) {
    this.id = user.id;
    this._email = user.email;
    this._registeredAt = user.registeredAt;
    this._tokens = user.tokens;
    this._emailVerifications = user._emailVerifications;
  }

  public get email() {
    return this._email;
  }

  public get registeredAt() {
    return this._registeredAt;
  }

  public get tokens() {
    return this._tokens;
  }

  public setEmail(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setEmail'>,
    selfContext: ISelfContext,
  ): void {
    this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'setEmail',
    );
    this.validateSelfContextOrThrow(selfContext);

    this._email = validEmailVerificationAnswerContext.emailVerification.email;
  }

  public createCookieToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createCookieToken'>,
  ): IAuthenticationToken {
    this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'createCookieToken',
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 365 * 24 * 60 * 60 * 1000);

    const token = new AuthenticationToken({
      type: 'cookie',
      expiresAt,
      ipAddress: '',
      userAgent: '',
      ownerId: this.id,
    });
    this._tokens.push(token);
    return token;
  }

  public createBearerToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createBearerToken'>,
    selfContext: ISelfContext,
  ): IAuthenticationToken {
    this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'createBearerToken',
    );
    this.validateSelfContextOrThrow(selfContext);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 30 * 24 * 60 * 60 * 1000);

    const token = new AuthenticationToken({
      type: 'bearer',
      expiresAt,
      ipAddress: '',
      userAgent: '',
      ownerId: this.id,
    });
    this._tokens.push(token);
    return token;
  }

  public deleteToken(tokenId: IAuthenticationToken['id'], selfContext: ISelfContext): void {
    this.validateSelfContextOrThrow(selfContext);
    this._tokens.replace(...this._tokens.filter((token) => token.id !== tokenId));
  }

  public createEmailVerification<F extends Exclude<TEmailVerificationPurpose, 'createCookieToken'>>(
    emailVerification: Pick<IEmailVerification<F>, 'email' | 'for'>,
    selfContext: ISelfContext,
  ): IEmailVerification<F> {
    this.validateSelfContextOrThrow(selfContext);

    const now = new Date();

    const duplicatedCount = this._emailVerifications.filter(
      (v) =>
        v.isValidAt(now) && emailVerification.email === v.email && emailVerification.for === v.for,
    ).length;

    if (duplicatedCount > 3) {
      throw new TooManyRequestsException(
        '短時間のうちに同じ内容のメール認証を行うことはできません。',
      );
    }

    const newEmailVerification = new EmailVerification({
      email: emailVerification.email,
      for: emailVerification.for,
      userId: this.id,
    });
    this._emailVerifications.push(newEmailVerification);
    return newEmailVerification;
  }

  public createEmailVerificationForCookieToken(): IEmailVerification<'createCookieToken'> {
    const now = new Date();

    const duplicatedCount = this._emailVerifications.filter(
      (v) => v.isValidAt(now) && v.email === this.email && v.for === 'createCookieToken',
    ).length;

    if (duplicatedCount > 3) {
      throw new TooManyRequestsException(
        '短時間のうちに同じ内容のメール認証を行うことはできません。',
      );
    }

    const newEmailVerification = new EmailVerification({
      email: this.email,
      for: 'createCookieToken',
      userId: this.id,
    });
    this._emailVerifications.push(newEmailVerification);
    return newEmailVerification;
  }

  public validateEmailVerificationAnswerOrThrow<F extends TEmailVerificationPurpose>(
    answer: IEmailVerificationAnswer<F>,
  ): IValidEmailVerificationAnswerContext<F> {
    const now = new Date();

    const matchedVerification = this._emailVerifications.find<IEmailVerification<F>>(
      (verification): verification is IEmailVerification<F> =>
        answer.id === verification.id && answer.for === verification.for,
    );

    if (!matchedVerification || !matchedVerification.isValidAt(now)) {
      throw new EmailVerificationExpiredException('認証コードの有効期限が切れています。');
    }
    if (!matchedVerification.check(answer.answer)) {
      throw new InvalidEmailVerificationAnswerException('認証コードが正しくありません。');
    }

    return {
      __brand: 'IValidEmailVerificationAnswerContext',
      emailVerification: matchedVerification,
      userId: this.id,
    };
  }

  public validateValidEmailVerificationAnswerContextOrThrow<F extends TEmailVerificationPurpose>(
    context: IValidEmailVerificationAnswerContext<F>,
    purpose: F,
  ): void {
    if (context.userId !== this.id || context.emailVerification.for !== purpose) {
      throw new InternalContextValidationError();
    }

    const now = new Date();

    // 無効または回答済みの認証を削除する。
    this._emailVerifications.replace(
      ...this._emailVerifications.filter(
        (verification) =>
          context.emailVerification.id !== verification.id || !verification.isValidAt(now),
      ),
    );
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
