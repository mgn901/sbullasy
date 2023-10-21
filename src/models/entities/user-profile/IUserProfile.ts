import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroupProfile } from '../group-profile/IGroupProfile.ts';
import { IEmailVerificationAnswer } from '../user/IEmailVerificationAnswer.ts';
import { IUser } from '../user/IUser.ts';

/**
 * ユーザーのプロフィールを表すエンティティクラス。
 * グループの所属ユーザーに公開されるプロフィールの情報を持つ。
 * 作成にはメールアドレス認証（種類が`setProfileExpiresAt`である）が必要である。
 */
export interface IUserProfile {
  readonly __brand: 'IUserProfile';

  /**
   * ユーザーのID。
   */
  readonly id: IUser['id'];

  /**
   * ユーザーの名前。
   */
  name: TName;

  /**
   * ユーザーの表示名。
   */
  displayName: TDisplayName;

  /**
   * ユーザーのプロフィールの有効期限。
   */
  expiresAt: Date | undefined;

  /**
   * ユーザーが所属しているグループの一覧。
   */
  readonly belongsTo: IGroupProfile[];

  /**
   * ユーザーの情報を変更する。
   * @param userProfile 変更後の情報。
   * @param selfCredential 変更しようとしているのがユーザー本人であることを示す情報。
   */
  updateUserProfile(
    userProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    selfCredential: ISelfContext,
  ): void;

  /**
   * 指定した日時においてプロフィールが有効であるかどうか。
   * @param date 日時の指定。この日時においてプロフィールが有効であるかどうかを返す。
   */
  isExpiresAt(date: Date): boolean;

  /**
   * プロフィールの有効期限を変更する。
   * @param emailVerificationAnswer この操作のために作成したメールアドレス認証の答え。
   * @param selfCredential 変更しようとしているのがユーザー本人であることを示す情報。
   */
  setExpiresAt(
    emailVerificationAnswer: IEmailVerificationAnswer,
    selfCredential: ISelfContext,
  ): void;
}
