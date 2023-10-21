import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { TShortSecret } from '../../values/TShortSecret.ts';
import { IGroup } from '../group/IGroup.ts';
import { IUserProfile } from '../user-profile/IUserProfile.ts';
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
  members: IMember[];

  /**
   * グループの招待コードをリセットする。
   * @param groupAdminCredential 変更しようとしているのがグループの管理者であることを示す情報。
   */
  resetInvitationCode(groupAdminCredential: IGroupAdminContext): void;

  /**
   * 所属ユーザーの一覧を変更する。
   * @param members 変更後の値。
   * @param groupAdminCredential 変更しようとしているのがグループの管理者であることを示す情報。
   */
  setMembers(members: IMember[], groupAdminCredential: IGroupAdminContext): void;

  /**
   * 招待コードを使用してユーザーに参加する。
   * @param userProfile 参加しようとしているユーザーのプロフィール。
   * @param invitationCode グループの招待コード。
   * @param selfCredential 参加しようとしているのがユーザー本人であることを示す情報。
   */
  joinByInvitationCode(
    userProfile: IUserProfile,
    invitationCode: IGroupMemberDirectory['invitationCode'],
    selfCredential: ISelfContext,
  ): void;
}
