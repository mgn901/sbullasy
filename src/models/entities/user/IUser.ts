import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { TId } from '../../values/TId.ts';
import { IAuthenticationToken } from './IAuthenticationToken.ts';
import { IEmailVerification } from './IEmailVerification.ts';
import { IEmailVerificationAnswer } from './IEmailVerificationAnswer.ts';

/**
 * ユーザーを表すエンティティクラス。
 */
export interface IUser {
  readonly __brand: 'IUser';

  /**
   * ユーザーのID。
   */
  readonly id: TId<IUser>;

  /**
   * ユーザーのEメールアドレス。
   * トークン発行用メールアドレス認証の送信先として用いる。
   * インスタンス内でユーザーのEメールアドレスが重複してはならない（大文字・小文字が異なる場合も重複とみなす）。
   */
  email: string;

  /**
   * ユーザーの登録日時。
   * ユーザーが初めてトークンを発行した日時。
   * まだトークンを一度も発行していない場合は`undefined`になる。
   */
  registeredAt: Date | undefined;

  /**
   * ユーザーが持っているトークンの一覧。
   */
  tokens: IAuthenticationToken[];

  /**
   * ユーザーに関連付けられているメールアドレス認証の一覧。
   */
  emailVerifications: IEmailVerification[];

  /**
   * ユーザーのEメールアドレスを変更する。
   * @param emailVerificationAnswer この操作のために作成したメールアドレス認証に対する答え。
   * @param selfCredential 変更しようとしているのがユーザー本人であることを示す情報。
   */
  setEmail(emailVerificationAnswer: IEmailVerificationAnswer, selfCredential: ISelfContext): void;

  /**
   * ユーザーの新しいCookieとして使用できるトークンを作成する。
   * @param emailVerificationAnswer この操作のために作成したメールアドレス認証に対する答え。
   */
  createCookieToken(emailVerificationAnswer: IEmailVerificationAnswer): IAuthenticationToken;

  /**
   * ユーザーの新しいBearer Tokenとして使用できるトークンを作成する。
   * @param emailVerificationAnswer この操作のために作成したメールアドレス認証に対する答え。
   * @param selfCredential 作成しようとしているのがユーザー本人であることを示す情報。
   */
  createBearerToken(
    emailVerificationAnswer: IEmailVerificationAnswer,
    selfCredential: ISelfContext,
  ): IAuthenticationToken;

  /**
   * ユーザーに関連する新しいメールアドレス認証を作成する。
   * 第1引数`emailVerification`の内容が同じメールアドレス認証を、そのメールアドレス認証が期限切れになる前に新たに作成することはできない。
   * @param emailVerification 作成するメールアドレス認証の内容。
   */
  createEmailVerification(
    emailVerification: Pick<IEmailVerification, 'email' | 'for'>,
  ): IEmailVerification;
}
