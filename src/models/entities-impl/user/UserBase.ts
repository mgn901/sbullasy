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
class AuthenticationTokenInternal extends AuthenticationTokenBase {
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
class EmailVerificationInternal<
  F extends TEmailVerificationPurpose,
> extends EmailVerificationBase<F> {
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

class UserInternal implements IUser {
  public readonly __brand = 'IUser';

  public readonly id: IUser['id'];

  public readonly email: IUser['email'];

  public readonly registeredAt: IUser['registeredAt'];

  public readonly tokens: IUser['tokens'];

  private readonly _emailVerifications: Readonly<
    ArrayWithDiff<IEmailVerification<TEmailVerificationPurpose>>
  >;

  public constructor(
    user: Pick<IUser, 'id' | 'email' | 'registeredAt' | 'tokens'> & {
      _emailVerifications: Readonly<ArrayWithDiff<IEmailVerification<TEmailVerificationPurpose>>>;
    },
  ) {
    this.id = user.id;
    this.email = user.email;
    this.registeredAt = user.registeredAt;
    this.tokens = user.tokens;
    this._emailVerifications = user._emailVerifications;
  }

  public setEmail(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setEmail'>,
    selfContext: ISelfContext,
  ): IUser {
    const validatedUser = this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'setEmail',
    );

    this.validateSelfContextOrThrow(selfContext);

    const { email } = validEmailVerificationAnswerContext.emailVerification;

    return new UserInternal({
      ...validatedUser,
      email,
      _emailVerifications: this._emailVerifications,
    });
  }

  public createCookieToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createCookieToken'>,
  ): { newUser: IUser; newToken: IAuthenticationToken } {
    const validatedUser = this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'createCookieToken',
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 365 * 24 * 60 * 60 * 1000);
    const newToken = new AuthenticationTokenInternal({
      type: 'cookie',
      expiresAt,
      ipAddress: '',
      userAgent: '',
      ownerId: this.id,
    });

    return {
      newUser: new UserInternal({
        ...validatedUser,
        tokens: this.tokens.toReplaced(...this.tokens, newToken),
        _emailVerifications: this._emailVerifications,
      }),
      newToken,
    };
  }

  public createBearerToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createBearerToken'>,
    selfContext: ISelfContext,
  ): { newUser: IUser; newToken: IAuthenticationToken } {
    const validatedUser = this.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'createBearerToken',
    );
    this.validateSelfContextOrThrow(selfContext);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 30 * 24 * 60 * 60 * 1000);

    const newToken = new AuthenticationTokenInternal({
      type: 'bearer',
      expiresAt,
      ipAddress: '',
      userAgent: '',
      ownerId: this.id,
    });

    return {
      newUser: new UserInternal({
        ...validatedUser,
        tokens: this.tokens.toReplaced(...this.tokens, newToken),
        _emailVerifications: this._emailVerifications,
      }),
      newToken,
    };
  }

  public deleteToken(tokenId: IAuthenticationToken['id'], selfContext: ISelfContext): IUser {
    this.validateSelfContextOrThrow(selfContext);
    return new UserInternal({
      ...this,
      tokens: this.tokens.toReplaced(...this.tokens.filter((token) => token.id !== tokenId)),
      _emailVerifications: this._emailVerifications,
    });
  }

  public createEmailVerification<F extends Exclude<TEmailVerificationPurpose, 'createCookieToken'>>(
    emailVerification: Pick<IEmailVerification<F>, 'email' | 'for'>,
    selfContext: ISelfContext,
  ): {
    newUser: IUser;
    newEmailVerification: IEmailVerification<F>;
  } {
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

    const newEmailVerification = new EmailVerificationInternal({
      email: emailVerification.email,
      for: emailVerification.for,
      userId: this.id,
    });

    return {
      newUser: new UserInternal({
        ...this,
        _emailVerifications: this._emailVerifications.toReplaced(
          ...this._emailVerifications,
          newEmailVerification,
        ),
      }),
      newEmailVerification,
    };
  }

  public createEmailVerificationForCookieToken(): {
    newUser: IUser;
    newEmailVerification: IEmailVerification<'createCookieToken'>;
  } {
    const now = new Date();

    const duplicatedCount = this._emailVerifications.filter(
      (v) => v.isValidAt(now) && v.email === this.email && v.for === 'createCookieToken',
    ).length;

    if (duplicatedCount > 3) {
      throw new TooManyRequestsException(
        '短時間のうちに同じ内容のメール認証を行うことはできません。',
      );
    }

    const newEmailVerification = new EmailVerificationInternal({
      email: this.email,
      for: 'createCookieToken',
      userId: this.id,
    });

    return {
      newUser: new UserInternal({
        ...this,
        _emailVerifications: this._emailVerifications.toReplaced(
          ...this._emailVerifications,
          newEmailVerification,
        ),
      }),
      newEmailVerification,
    };
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
  ): IUser {
    if (context.userId !== this.id || context.emailVerification.for !== purpose) {
      throw new InternalContextValidationError();
    }

    const now = new Date();

    // 無効または回答済みの認証を削除する。
    return new UserInternal({
      ...this,
      _emailVerifications: this._emailVerifications.toReplaced(
        ...this._emailVerifications.filter(
          (verification) =>
            context.emailVerification.id !== verification.id || !verification.isValidAt(now),
        ),
      ),
    });
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }

  public dangerouslyGetEmailVerifications(): Readonly<
    ArrayWithDiff<IEmailVerification<TEmailVerificationPurpose>>
  > {
    return this._emailVerifications;
  }
}

/**
 * {@linkcode IUser}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class UserBase extends UserInternal {}
