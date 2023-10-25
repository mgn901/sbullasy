import { IGroupMemberDirectory } from '../../models/entities/group-member-directory/IGroupMemberDirectory.ts';

/**
 * {@linkcode IGroupMemberDirectory}のリポジトリ。
 */
export interface IGroupMemberDirectoryRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param groupId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(groupId: IGroupMemberDirectory['id']): Promise<IGroupMemberDirectory>;

  /**
   * 指定した招待コードを持つオブジェクトを1件取得する。
   * @param invitationCode 取得するオブジェクトの招待コード。
   */
  getOneByInvitationCodeOrThrow(
    invitationCode: IGroupMemberDirectory['invitationCode'],
  ): Promise<IGroupMemberDirectory>;

  /**
   * オブジェクトを永続化する。
   * @param groupMemberDirectory 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(groupMemberDirectory: IGroupMemberDirectory, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param groupId 削除するオブジェクトのID。
   */
  deleteOneById(groupId: IGroupMemberDirectory['id']): Promise<void>;
}
