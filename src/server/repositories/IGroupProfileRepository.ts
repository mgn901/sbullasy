import { IGroupProfile } from '../../models/entities/group-profile/IGroupProfile.ts';
import { IRepositoryGetManyOptions } from './IRepositoryGetManyOptions.ts';

/**
 * {@linkcode IGroupProfile}のリポジトリ。
 */
export interface IGroupProfileRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param groupId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(groupId: IGroupProfile['id']): Promise<IGroupProfile>;

  /**
   * 指定した名前を持つオブジェクトを1件取得する。
   * @param groupName 取得するオブジェクトの名前。
   */
  getOneByNameOrThrow(groupName: IGroupProfile['name']): Promise<IGroupProfile>;

  /**
   * 指定した条件でオブジェクトを複数件取得する。
   * @param options 取得時の挙動の設定。
   */
  getMany(
    options: IRepositoryGetManyOptions<'id_asc' | 'name_asc', IGroupProfile['id']>,
  ): Promise<IGroupProfile[]>;

  /**
   * オブジェクトを永続化する。
   * @param groupProfile 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(groupProfile: IGroupProfile, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param groupId 削除するオブジェクトのID。
   */
  deleteOneById(groupId: IGroupProfile['id']): Promise<void>;
}
