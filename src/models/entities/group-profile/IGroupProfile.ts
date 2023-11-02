import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TName } from '../../values/TName.ts';
import { IGroup } from '../group/IGroup.ts';
import { IItemTypeSummary } from '../item-type/IItemTypeSummary.ts';
import { IBadge } from '../item/IBadge.ts';
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
  readonly name: TName;

  /**
   * グループの表示名。
   */
  readonly displayName: TDisplayName;

  /**
   * グループが保有しているバッジの一覧。
   * グループが大学の公認団体であることを表す際などに用いる。
   */
  readonly badges: Readonly<ArrayWithDiff<IBadge>>;

  /**
   * グループが編集できるアイテムの種類の一覧。
   */
  readonly editableItemTypes: Readonly<ArrayWithDiff<IItemTypeSummary>>;

  /**
   * グループが所有しているアイテムの一覧。
   */
  readonly items: IItemSummary[];

  /**
   * グループのプロフィールの情報を変更する。
   * @param newGroupProfile 変更後の値。
   * @param groupAdminContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  updateGroupProfile(
    newGroupProfile: Pick<IGroupProfile, 'name' | 'displayName'>,
    groupAdminContext: IGroupAdminContext,
  ): IGroupProfile;

  /**
   * グループが保有しているバッジの一覧を変更する。
   * @param newBadges 変更後の値。
   * @param instanceOperatorContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  setBadges(newBadges: IBadge[], instanceOperatorContext: IInstanceOperatorContext): IGroupProfile;

  /**
   * グループが編集できるアイテムの種類の一覧を変更する。
   * @param newItemTypes 変更後の値。
   * @param instanceOperatorContext この操作を行おうとしているユーザーがインスタンスのオペレーターであることを示す情報。
   */
  setEditableItemTypes(
    newItemTypes: IItemTypeSummary[],
    instanceOperatorContext: IInstanceOperatorContext,
  ): IGroupProfile;

  /**
   * 第1引数に渡したcontextがこのグループのプロフィールを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateGroupMemberContextOrThrow(context: IGroupAdminContext | IGroupMemberContext): void;
}
