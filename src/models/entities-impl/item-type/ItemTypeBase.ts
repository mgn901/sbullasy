import { IInstanceAdminContext } from '../../contexts/IInstanceAdminContext.ts';
import { IItemType } from '../../entities/item-type/IItemType.ts';

class ItemType implements IItemType {
  public readonly __brand = 'IItemType';

  public readonly id: IItemType['id'];

  public readonly nameSingular: IItemType['nameSingular'];

  public readonly namePlural: IItemType['namePlural'];

  public readonly displayName: IItemType['displayName'];

  public readonly schema: IItemType['schema'];

  public readonly options: IItemType['options'];

  public constructor(
    itemType: Pick<
      IItemType,
      'id' | 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options'
    >,
  ) {
    this.id = itemType.id;
    this.nameSingular = itemType.nameSingular;
    this.namePlural = itemType.namePlural;
    this.displayName = itemType.displayName;
    this.schema = itemType.schema;
    this.options = itemType.options;
  }

  public updateItemType(
    newItemType: Pick<
      IItemType,
      'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options'
    >,
    _instanceAdminContext: IInstanceAdminContext,
  ): IItemType {
    const { nameSingular, namePlural, displayName, schema, options } = newItemType;
    return new ItemType({ ...this, nameSingular, namePlural, displayName, schema, options });
  }
}

/**
 * {@linkcode IItemType}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class ItemTypeBase extends ItemType {}
