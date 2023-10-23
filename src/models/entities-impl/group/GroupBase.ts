import { IInstanceOperatorContext } from '../../context/IInstanceOperatorContext.ts';
import { IGroup } from '../../entities/group/IGroup.ts';

/**
 * {@linkcode IGroup}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupBase implements IGroup {
  public readonly __brand = 'IGroup';

  public readonly id: IGroup['id'];

  public readonly createdAt: IGroup['createdAt'];

  private _instanceRole: IGroup['instanceRole'];

  public constructor(group: Pick<IGroup, 'id' | 'createdAt' | 'instanceRole'>) {
    this.id = group.id;
    this.createdAt = group.createdAt;
    this._instanceRole = group.instanceRole;
  }

  public get instanceRole() {
    return this._instanceRole;
  }

  public setInstanceRole(
    instanceRole: 'admin' | 'operator' | 'moderator' | 'default',
    _instanceOperatorContext: IInstanceOperatorContext,
  ): void {
    this._instanceRole = instanceRole;
  }
}
