import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroup } from '../group/IGroup.ts';
import { IItemTypeSummary } from '../item-type/IItemTypeSummary.ts';
import { IItemSummary } from '../item/IItemSummary.ts';

/**
 * グループ内外に公開するグループのプロフィールを表すエンティティクラス。
 */
export interface IGroupProfile {
  readonly __brand: 'IGroupProfile';

  /**
   * グループのID。
   */
  readonly id: IGroup['id'];

  /**
   * グループの名前。
   */
  name: TName;

  /**
   * グループの表示名。
   */
  displayName: TDisplayName;

  /**
   * グループが保有しているバッジの一覧。
   * グループが大学の公認団体であることを表す際などに用いる。
   */
  badges: IItemSummary[];

  /**
   * グループが編集できるアイテムの種類の一覧。
   */
  editableItemTypes: IItemTypeSummary[];

  /**
   * グループが所有しているアイテムの一覧。
   */
  readonly items: IItemSummary[];

  /**
   * グループのプロフィールの情報を変更する。
   * @param groupProfile 変更後の値。
   * @param groupAdminContext 変更しようとしているのがインスタンスのオペレーターであることを示す情報。
   */
  updateGroupProfile(
    groupProfile: Pick<IGroupProfile, 'name' | 'displayName'>,
    groupAdminContext: IGroupAdminContext,
  ): void;

  /**
   * グループが保有しているバッジの一覧を変更する。
   * @param badges 変更後の値。
   * @param instanceOperatorContext 変更しようとしているのがインスタンスのオペレーターであることを示す情報。
   */
  setBadges(badges: IItemSummary['id'][], instanceOperatorContext: IInstanceOperatorContext): void;

  /**
   * グループが編集できるアイテムの種類の一覧を変更する。
   * @param itemTypes 変更後の値。
   * @param instanceOperatorContext 変更しようとしているのがインスタンスのオペレーターであることを示す情報。
   */
  setEditableItemTypes(
    itemTypes: IItemTypeSummary['id'][],
    instanceOperatorContext: IInstanceOperatorContext,
  ): void;
}
