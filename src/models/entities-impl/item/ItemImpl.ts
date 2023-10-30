import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IGroupProfile } from '../../entities/group-profile/IGroupProfile.ts';
import { IItem } from '../../entities/item/IItem.ts';
import { NoPermissionException } from '../../errors/NoPermissionException.ts';
import { generateId } from '../../values/TId.ts';
import { ItemBase } from './ItemBase.ts';

/**
 * {@linkcode ItemBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class ItemImpl extends ItemBase {
  public constructor(
    item: Readonly<
      Pick<IItem, 'title' | 'titleForUrl' | 'publishedAt' | 'type' | 'body'> & {
        owner: IGroupProfile;
      }
    >,
    groupMemberContext: IGroupMemberContext,
  ) {
    item.owner.validateGroupMemberContextOrThrow(groupMemberContext);
    const isEditable = item.owner.editableItemTypes.some(
      (itemType) => itemType.id === item.type.id,
    );
    if (!isEditable) {
      throw new NoPermissionException();
    }

    const now = new Date();

    super({
      id: generateId(),
      title: item.title,
      titleForUrl: item.titleForUrl,
      createdAt: now,
      updatedAt: now,
      publishedAt: item.publishedAt,
      owner: item.owner,
      type: item.type,
      body: item.body,
    });
  }
}
