import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { IGroupProfileSummary } from '../../../models/entities/group-profile/IGroupProfileSummary.ts';
import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定した条件でグループのプロフィールのエンティティオブジェクトを複数件取得する。
 * @param options 取得方法の設定。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したグループのプロフィールのエンティティオブジェクトの配列。
 */
export const getGroupProfileSummaries = async (
  options: IRepositoryGetManyOptions<'id_asc' | 'name_asc', IGroupProfile['id']>,
  implementations: IImplementations,
): Promise<IGroupProfileSummary[]> => implementations.groupProfileRepository.getSummaries(options);
