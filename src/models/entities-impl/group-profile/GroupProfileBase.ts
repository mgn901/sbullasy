import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { IGroupProfile } from '../../entities/group-profile/IGroupProfile.ts';
import { IItemTypeSummary } from '../../entities/item-type/IItemTypeSummary.ts';
import { IItemSummary } from '../../entities/item/IItemSummary.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

/**
 * {@linkcode IGroupProfile}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupProfileBase implements IGroupProfile {
  public readonly __brand = 'IGroupProfile';

  public readonly id: IGroupProfile['id'];

  private _name: IGroupProfile['name'];

  private _displayName: IGroupProfile['displayName'];

  private readonly _badges: IGroupProfile['badges'];

  private readonly _editableItemTypes: IGroupProfile['editableItemTypes'];

  public readonly items: IGroupProfile['items'];

  public constructor(
    groupProfile: Pick<
      IGroupProfile,
      'id' | 'name' | 'displayName' | 'badges' | 'editableItemTypes' | 'items'
    >,
  ) {
    this.id = groupProfile.id;
    this._name = groupProfile.name;
    this._displayName = groupProfile.displayName;
    this._badges = groupProfile.badges;
    this._editableItemTypes = groupProfile.editableItemTypes;
    this.items = groupProfile.items;
  }

  public get name() {
    return this._name;
  }

  public get displayName() {
    return this._displayName;
  }

  public get badges() {
    return this._badges;
  }

  public get editableItemTypes() {
    return this._editableItemTypes;
  }

  public updateGroupProfile(
    newGroupProfile: Pick<IGroupProfile, 'name' | 'displayName'>,
    groupAdminContext: IGroupAdminContext,
  ): void {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    this._name = newGroupProfile.name;
    this._displayName = newGroupProfile.displayName;
  }

  public setBadges(
    newBadges: IItemSummary[],
    _instanceOperatorContext: IInstanceOperatorContext,
  ): void {
    this._badges.replace(...newBadges);
  }

  public setEditableItemTypes(
    newItemTypes: IItemTypeSummary[],
    _instanceOperatorContext: IInstanceOperatorContext,
  ): void {
    this._editableItemTypes.replace(...newItemTypes);
  }

  public validateGroupMemberContextOrThrow(
    context: IGroupAdminContext | IGroupMemberContext,
  ): void {
    if (context.groupId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
