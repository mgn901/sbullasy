import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidEmailVerificationAnswerContext } from '../../contexts/IValidEmailVerificationAnswerContext.ts';
import { IValidUserProfileContext } from '../../contexts/IValidUserProfileContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroupProfileSummary } from '../group-profile/IGroupProfileSummary.ts';
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
  readonly name: TName;

  /**
   * ユーザーの表示名。
   */
  readonly displayName: TDisplayName;

  /**
   * ユーザーのプロフィールの有効期限。
   */
  readonly expiresAt: Date | undefined;

  /**
   * ユーザーが所属しているグループの一覧。
   */
  readonly belongsTo: IGroupProfileSummary[];

  /**
   * ユーザーのプロフィールの情報を変更する。
   * @param newUserProfile 変更後の情報。
   * @param selfContext この操作を行おうとしているユーザーが操作対象のユーザー本人であることを示す情報。
   */
  updateUserProfile(
    newUserProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    selfContext: ISelfContext,
  ): IUserProfile;

  /**
   * 指定した日時においてプロフィールが有効であるかどうか。
   * @param date 日時の指定。この日時においてプロフィールが有効であるかどうかを返す。
   */
  isValidAt(date: Date): boolean;

  /**
   * プロフィールの有効期限を変更する。
   * @param validEmailVerificationAnswerContext この操作のために作成したメール認証に対する回答が有効であることを示す情報。
   * @param selfContext この操作を行おうとしているユーザーが操作対象のユーザー本人であることを示す情報。
   * @param user このユーザーのエンティティオブジェクト。
   */
  setExpiresAt(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setProfileExpiresAt'>,
    selfContext: ISelfContext,
    user: IUser,
  ): { newUserProfile: IUserProfile; newUser: IUser };

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateSelfContextOrThrow(context: ISelfContext): void;

  /**
   * 第1引数に渡したcontextがこのユーザーを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateValidUserProfileContextOrThrow(context: IValidUserProfileContext): void;
}
