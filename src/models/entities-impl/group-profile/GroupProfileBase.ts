import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IInstanceOperatorContext } from '../../contexts/IInstanceOperatorContext.ts';
import { IGroupProfile } from '../../entities/group-profile/IGroupProfile.ts';
import { IItemTypeSummary } from '../../entities/item-type/IItemTypeSummary.ts';
import { IItemSummary } from '../../entities/item/IItemSummary.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

class GroupProfileInternal implements IGroupProfile {
  public readonly __brand = 'IGroupProfile';

  public readonly id: IGroupProfile['id'];

  public readonly name: IGroupProfile['name'];

  public readonly displayName: IGroupProfile['displayName'];

  public readonly badges: IGroupProfile['badges'];

  public readonly editableItemTypes: IGroupProfile['editableItemTypes'];

  public readonly items: IGroupProfile['items'];

  public constructor(
    groupProfile: Pick<
      IGroupProfile,
      'id' | 'name' | 'displayName' | 'badges' | 'editableItemTypes' | 'items'
    >,
  ) {
    this.id = groupProfile.id;
    this.name = groupProfile.name;
    this.displayName = groupProfile.displayName;
    this.badges = groupProfile.badges;
    this.editableItemTypes = groupProfile.editableItemTypes;
    this.items = groupProfile.items;
  }

  public updateGroupProfile(
    newGroupProfile: Pick<IGroupProfile, 'name' | 'displayName'>,
    groupAdminContext: IGroupAdminContext,
  ): IGroupProfile {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    const { name, displayName } = newGroupProfile;
    return new GroupProfileInternal({ ...this, name, displayName });
  }

  public setBadges(
    newBadges: IItemSummary[],
    _instanceOperatorContext: IInstanceOperatorContext,
  ): IGroupProfile {
    return new GroupProfileInternal({ ...this, badges: this.badges.toReplaced(...newBadges) });
  }

  public setEditableItemTypes(
    newItemTypes: IItemTypeSummary[],
    _instanceOperatorContext: IInstanceOperatorContext,
  ): IGroupProfile {
    return new GroupProfileInternal({
      ...this,
      editableItemTypes: this.editableItemTypes.toReplaced(...newItemTypes),
    });
  }

  public validateGroupMemberContextOrThrow(
    context: IGroupAdminContext | IGroupMemberContext,
  ): void {
    if (context.groupId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}

/**
 * {@linkcode IGroupProfile}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupProfileBase extends GroupProfileInternal {}
