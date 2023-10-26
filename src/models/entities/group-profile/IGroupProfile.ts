import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroup } from '../group/IGroup.ts';
import { IItemTypeSummary } from '../item-type/IItemTypeSummary.ts';
import { IItemSummary } from '../item/IItemSummary.ts';

/**
 * グループ内外に公開するグループのプロフィールを表すエンティティクラス。
 *
 * グループが作成されるのと同時に作成される。
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
   * この操作はミュータブルである。
   * @param newGroupProfile 変更後の値。
   * @param groupAdminContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  updateGroupProfile(
    newGroupProfile: Pick<IGroupProfile, 'name' | 'displayName'>,
    groupAdminContext: IGroupAdminContext,
  ): void;

  /**
   * グループが保有しているバッジの一覧を変更する。
   * この操作はミュータブルである。
   * @param newBadges 変更後の値。
   * @param instanceOperatorContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  setBadges(newBadges: IItemSummary[], instanceOperatorContext: IInstanceOperatorContext): void;

  /**
   * グループが編集できるアイテムの種類の一覧を変更する。
   * この操作はミュータブルである。
   * @param newItemTypes 変更後の値。
   * @param instanceOperatorContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  setEditableItemTypes(
    newItemTypes: IItemTypeSummary[],
    instanceOperatorContext: IInstanceOperatorContext,
  ): void;

  /**
   * 第1引数に渡したcontextがこのグループのプロフィールを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateGroupMemberContextOrThrow(context: IGroupAdminContext | IGroupMemberContext): void;
}
