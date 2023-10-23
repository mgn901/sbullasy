import { IValidEmailVerificationAnswerContext } from '../../context/IValidEmailVerificationAnswerContext.ts';
import { ISelfContext } from '../../context/ISelfContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroupProfile } from '../group-profile/IGroupProfile.ts';
import { IUser } from '../user/IUser.ts';

/**
 * ユーザーのプロフィールを表すエンティティクラス。
 * グループの所属ユーザーに公開されるプロフィールの情報を持つ。
 * 作成にはメール認証（種類が`setProfileExpiresAt`である）が必要である。
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
   * @param newUserProfile 変更後の情報。
   * @param selfContext 変更しようとしているのがユーザー本人であることを示す情報。
   */
  updateUserProfile(
    newUserProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    selfContext: ISelfContext,
  ): void;

  /**
   * 指定した日時においてプロフィールが有効であるかどうか。
   * @param date 日時の指定。この日時においてプロフィールが有効であるかどうかを返す。
   */
  isValidAt(date: Date): boolean;

  /**
   * プロフィールの有効期限を変更する。
   * @param emailVerificationContext メール認証を通過していることを示す情報。
   * @param selfContext 変更しようとしているのがユーザー本人であることを示す情報。
   * @param user このユーザーのエンティティオブジェクト。
   */
  setExpiresAt(
    emailVerificationContext: IValidEmailVerificationAnswerContext<'setProfileExpiresAt'>,
    selfContext: ISelfContext,
    user: IUser,
  ): void;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateSelfContextOrThrow(context: ISelfContext): void;
}
