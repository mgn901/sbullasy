import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidEmailVerificationAnswerContext } from '../../contexts/IValidEmailVerificationAnswerContext.ts';
import { TEmail } from '../../values/TEmail.ts';
import { TEmailVerificationPurpose } from '../../values/TEmailVerificationPurpose.ts';
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
   * トークン発行用メール認証の送信先として用いる。
   * インスタンス内でユーザーのEメールアドレスが重複してはならない（大文字・小文字が異なる場合も重複とみなす）。
   */
  email: TEmail;

  /**
   * ユーザーの登録日時。
   * ユーザーが初めてトークンを発行した日時。
   * まだトークンを一度も発行していない場合は`undefined`になる。
   */
  registeredAt: Date | undefined;

  /**
   * ユーザーが持っているトークンの一覧。
   */
  tokens: ArrayWithDiff<IAuthenticationToken>;

  /**
   * ユーザーのEメールアドレスを変更する。
   * **この操作はミュータブルである。**
   * @param validEmailVerificationAnswerContext メール認証を通過していることを示す情報。
   * @param selfContext この操作を行おうとしているユーザーが操作対象のユーザー本人であることを示す情報。
   */
  setEmail(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setEmail'>,
    selfContext: ISelfContext,
  ): void;

  /**
   * ユーザーの新しいCookieとして使用できるトークンを作成する。
   * **この操作はミュータブルである。**
   * @param validEmailVerificationAnswerContext メール認証を通過していることを示す情報。
   */
  createCookieToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createCookieToken'>,
  ): IAuthenticationToken;

  /**
   * ユーザーの新しいBearer Tokenとして使用できるトークンを作成する。
   * **この操作はミュータブルである。**
   * @param validEmailVerificationAnswerContext メール認証を通過していることを示す情報。
   * @param selfContext 作成しようとしているのがユーザー本人であることを示す情報。
   */
  createBearerToken(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'createBearerToken'>,
    selfContext: ISelfContext,
  ): IAuthenticationToken;

  /**
   * ユーザーのトークンを削除する。
   * **この操作はミュータブルである。**
   * @param tokenId 削除するトークンのID。
   * @param selfContext この操作を行おうとしているユーザーが操作対象のユーザー本人であることを示す情報。
   */
  deleteToken(tokenId: IAuthenticationToken['id'], selfContext: ISelfContext): void;

  /**
   * ユーザーに関連する新しいメール認証を作成する。
   * 第1引数`emailVerification`の内容が同じメール認証を、そのメール認証が期限切れになる前に新たに作成することはできない。
   * **この操作はミュータブルである。**
   * @param emailVerification 作成するメール認証の内容。
   */
  createEmailVerification<F extends Exclude<TEmailVerificationPurpose, 'createCookieToken'>>(
    emailVerification: Pick<IEmailVerification<F>, 'email' | 'for'>,
    selfContext: ISelfContext,
  ): IEmailVerification<F>;

  /**
   * Cookie Tokenの作成に用いるメール認証を作成する。
   * **この操作はミュータブルである。**
   */
  createEmailVerificationForCookieToken(): IEmailVerification<'createCookieToken'>;

  /**
   * 渡されたメール認証に対する回答が有効であるかを確認する。
   * @param answer メール認証に対する回答。
   */
  validateEmailVerificationAnswerOrThrow<F extends TEmailVerificationPurpose>(
    answer: IEmailVerificationAnswer<F>,
  ): IValidEmailVerificationAnswerContext<F>;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * **この操作はミュータブルである。**
   * @param context 有効であるかを確認するcontext。
   * @param purpose 有効とみなすメール認証の目的。
   */
  validateValidEmailVerificationAnswerContextOrThrow<F extends TEmailVerificationPurpose>(
    context: IValidEmailVerificationAnswerContext<F>,
    purpose: F,
  ): void;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateSelfContextOrThrow(context: ISelfContext): void;
}
