import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { IItem } from '../../entities/item/IItem.ts';
import { generateId } from '../../values/TId.ts';
import { ItemBase } from './ItemBase.ts';

/**
 * {@linkcode ItemBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class ItemImpl extends ItemBase {
  public constructor(
    item: Pick<IItem, 'displayName' | 'publishedAt' | 'owner' | 'type' | 'body'>,
    groupMemberContext: IGroupMemberContext,
  ) {
    item.owner.validateGroupMemberContextOrThrow(groupMemberContext);

    const now = new Date();

    super({
      id: generateId(),
      displayName: item.displayName,
      createdAt: now,
      updatedAt: now,
      publishedAt: item.publishedAt,
      owner: item.owner,
      type: item.type,
      body: item.body,
    });
  }
}
