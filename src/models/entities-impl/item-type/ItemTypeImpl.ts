import { IInstanceAdminContext } from '../../contexts/IInstanceAdminContext.ts';
import { IItemType } from '../../entities/item-type/IItemType.ts';
import { generateId } from '../../values/TId.ts';
import { ItemTypeBase } from './ItemTypeBase.ts';

/**
 * {@linkcode ItemTypeBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class ItemTypeImpl extends ItemTypeBase {
  public constructor(
    itemType: Pick<IItemType, 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'option'>,
    _instanceAdminContext: IInstanceAdminContext,
  ) {
    super({
      id: generateId(),
      nameSingular: itemType.nameSingular,
      namePlural: itemType.namePlural,
      displayName: itemType.displayName,
      schema: itemType.schema,
      option: itemType.option,
    });
  }
}
