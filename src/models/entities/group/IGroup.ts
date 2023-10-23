import { IInstanceOperatorContext } from '../../context/IInstanceOperatorContext.ts';
import { TId } from '../../values/TId.ts';

/**
 * グループを表すエンティティクラス。
 */
export interface IGroup {
  readonly __brand: 'IGroup';

  /**
   * グループのID。
   */
  readonly id: TId<IGroup>;

  /**
   * グループの作成日時。
   */
  readonly createdAt: Date;

  /**
   * グループのインスタンス内での役割。
   * - `'admin'`: インスタンスの管理者。インスタンスのアイテムの種類を作成・編集・削除できる。
   * - `'operator'`: インスタンスのオペレーター。グループが編集できるアイテムの種類を設定できる。
   * - `'moderator'`: インスタンスのモデレーター。通報に対応してアイテムを非公開にすることができる。
   * - `'default'`: 上記以外のグループ。
   */
  instanceRole: 'admin' | 'operator' | 'moderator' | 'default';

  /**
   * グループでのインスタンス内での役割の設定を変更する。
   * @param instanceRole 変更後の値。
   * @param instanceOperatorContext 変更しようとしているのがインスタンスのオペレーターであることを示す情報。
   */
  setInstanceRole(
    instanceRole: IGroup['instanceRole'],
    instanceOperatorContext: IInstanceOperatorContext,
  ): void;
}
