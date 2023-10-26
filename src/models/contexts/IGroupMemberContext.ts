import { IGroup } from '../entities/group/IGroup.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のグループの所属ユーザーであることを示す情報。
 */
export interface IGroupMemberContext {
  readonly __brand: 'IGroupMemberContext';

  /**
   * 操作対象のグループのグループID。
   */
  groupId: IGroup['id'];
}
