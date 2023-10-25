import { IGroup } from '../../models/entities/group/IGroup.ts';
import { IRepositoryGetManyOptions } from './IRepositoryGetManyOptions.ts';

/**
 * {@linkcode IGroup}のリポジトリ。
 */
export interface IGroupRepository {
  /**
   * 指定したIDを持つオブジェクトを1件取得する。
   * @param groupId 取得するオブジェクトのID。
   */
  getOneByIdOrThrow(groupId: IGroup['id']): Promise<IGroup>;

  /**
   * 指定した条件でオブジェクトを複数件取得する。
   * @param options 取得時の挙動の設定。
   */
  getMany(options: IRepositoryGetManyOptions<'id_asc', IGroup['id']>): Promise<IGroup[]>;

  /**
   * オブジェクトを永続化する。
   * @param group 永続化するオブジェクト。
   * @param override すでに同じIDのオブジェクトが存在した場合に上書きするか。
   */
  saveOne(group: IGroup, override?: boolean): Promise<void>;

  /**
   * 指定したIDを持つオブジェクトを削除する。
   * @param groupId 削除するオブジェクトのID。
   */
  deleteOneById(groupId: IGroup['id']): Promise<void>;
}
