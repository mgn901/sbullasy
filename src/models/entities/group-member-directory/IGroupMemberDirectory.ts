import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidUserProfileContext } from '../../contexts/IValidUserProfileContext.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IGroup } from '../group/IGroup.ts';
import { IUserProfile } from '../user-profile/IUserProfile.ts';
import { IUser } from '../user/IUser.ts';
import { IMember } from './IMember.ts';

/**
 * グループの所属ユーザーに関する情報を持つエンティティクラス。
 */
export interface IGroupMemberDirectory {
  readonly __brand: 'IGroupMemberDirectory';

  /**
   * グループのID。
   */
  readonly id: IGroup['id'];

  /**
   * グループの招待コード。
   * ユーザーにこのコードを入力させることで、そのユーザーはグループに参加できる。
   */
  invitationCode: TShortSecret;

  /**
   * グループの所属ユーザーの一覧。
   */
  members: ArrayWithDiff<IMember>;

  /**
   * グループの招待コードをリセットする。
   * @param groupAdminContext 変更しようとしているのがグループの管理者であることを示す情報。
   */
  resetInvitationCode(groupAdminContext: IGroupAdminContext): void;

  /**
   * 所属ユーザーのグループとの関係を変更する。
   * @param userProfile 変更対象の所属ユーザーのプロフィール。
   * @param type 変更後の値
   * @param groupAdminContext 変更しようとしているのがグループの管理者であることを示す情報。
   */
  updateMember(
    userProfile: IUserProfile,
    type: IMember['type'],
    groupAdminContext: IGroupAdminContext,
  ): void;

  /**
   * 所属ユーザーをグループから削除する。
   * @param userId 削除する所属ユーザーのユーザーID。
   * @param groupAdminContext 削除しようとしているのがグループの管理者であることを示す情報。
   */
  deleteMember(userId: IMember['user']['id'], groupAdminContext: IGroupAdminContext): void;

  /**
   * 所属ユーザーをグループから削除する。
   * @param user 削除する所属ユーザーのエンティティオブジェクト。
   * @param selfContext 削除しようとしているのが自分自身であることを示す情報。
   */
  deleteMember(user: IUser, selfContext: ISelfContext): void;

  /**
   * 招待コードを使用してグループに参加する。
   * @param userProfile 参加しようとしているユーザーのプロフィール。
   * @param invitationCode グループの招待コード。
   * @param selfContext 参加しようとしているのがユーザー本人であることを示す情報。
   * @param validUserProfileContext 参加しようとしているユーザーのプロフィールが有効であることを示す情報。
   */
  joinByInvitationCode(
    userProfile: IUserProfile,
    invitationCode: IGroupMemberDirectory['invitationCode'],
    selfContext: ISelfContext,
    validUserProfileContext: IValidUserProfileContext,
  ): void;

  /**
   * 第1引数に渡したcontextがこのグループを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateGroupMemberContextOrThrow(context: IGroupAdminContext | IGroupMemberContext): void;
}
