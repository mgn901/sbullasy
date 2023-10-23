import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IGroupAdminContext } from '../../context/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../context/IGroupMemberContext.ts';
import { IInstanceOperatorContext } from '../../context/IInstanceOperatorContext.ts';
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
  badges: ArrayWithDiff<IItemSummary>;

  /**
   * グループが編集できるアイテムの種類の一覧。
   */
  editableItemTypes: ArrayWithDiff<IItemTypeSummary>;

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
  setBadges(badges: IItemSummary[], instanceOperatorContext: IInstanceOperatorContext): void;

  /**
   * グループが編集できるアイテムの種類の一覧を変更する。
   * @param itemTypes 変更後の値。
   * @param instanceOperatorContext 変更しようとしているのがインスタンスのオペレーターであることを示す情報。
   */
  setEditableItemTypes(
    itemTypes: IItemTypeSummary[],
    instanceOperatorContext: IInstanceOperatorContext,
  ): void;

  /**
   * 第1引数に渡したcontextがこのグループを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateGroupMemberContextOrThrow(context: IGroupAdminContext | IGroupMemberContext): void;
}
