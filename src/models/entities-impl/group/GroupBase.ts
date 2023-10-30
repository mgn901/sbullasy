import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { IGroup } from '../../entities/group/IGroup.ts';

class GroupInternal implements IGroup {
  public readonly __brand = 'IGroup';

  public readonly id: IGroup['id'];

  public readonly createdAt: IGroup['createdAt'];

  public readonly instanceRole: IGroup['instanceRole'];

  public constructor(group: Pick<IGroup, 'id' | 'createdAt' | 'instanceRole'>) {
    this.id = group.id;
    this.createdAt = group.createdAt;
    this.instanceRole = group.instanceRole;
  }

  public setInstanceRole(
    instanceRole: 'admin' | 'operator' | 'moderator' | 'default',
    _instanceOperatorContext: IInstanceOperatorContext,
  ): IGroup {
    return new GroupInternal({ ...this, instanceRole });
  }
}

/**
 * {@linkcode IGroup}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupBase extends GroupInternal {}
