import { IGroup } from '../entities/group/IGroup.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のグループの管理者であることを示す情報。
 */
export interface IGroupAdminContext {
  readonly __brand: 'IGroupAdminContext';

  /**
   * 操作対象のグループのグループID。
   */
  readonly groupId: IGroup['id'];
}
