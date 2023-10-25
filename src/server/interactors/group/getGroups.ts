import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定した条件でグループのエンティティオブジェクトを複数件取得する。
 * @param options 取得方法の設定。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns グループのエンティティオブジェクトの配列。
 */
export const getGroups = async (
  options: IRepositoryGetManyOptions<'id_asc', IGroup['id']>,
  implementations: IImplementations,
): Promise<IGroup[]> => implementations.groupRepository.getMany(options);
