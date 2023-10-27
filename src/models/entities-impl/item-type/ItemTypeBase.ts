import { IInstanceAdminContext } from '../../contexts/IInstanceAdminContext.ts';
import { IItemType } from '../../entities/item-type/IItemType.ts';

/**
 * {@linkcode IItemType}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class ItemTypeBase implements IItemType {
  public readonly __brand = 'IItemType';

  public readonly id: IItemType['id'];

  private _nameSingular: IItemType['nameSingular'];

  private _namePlural: IItemType['namePlural'];

  private _displayName: IItemType['displayName'];

  private _schema: IItemType['schema'];

  private _options: IItemType['options'];

  public constructor(
    itemType: Pick<
      IItemType,
      'id' | 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options'
    >,
  ) {
    this.id = itemType.id;
    this._nameSingular = itemType.nameSingular;
    this._namePlural = itemType.namePlural;
    this._displayName = itemType.displayName;
    this._schema = itemType.schema;
    this._options = itemType.options;
  }

  public get nameSingular() {
    return this._nameSingular;
  }

  public get namePlural() {
    return this._namePlural;
  }

  public get displayName() {
    return this._displayName;
  }

  public get schema() {
    return this._schema;
  }

  public get options() {
    return this._options;
  }

  public updateItemType(
    newItemType: Pick<
      IItemType,
      'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options'
    >,
    _instanceAdminContext: IInstanceAdminContext,
  ): void {
    this._nameSingular = newItemType.nameSingular;
    this._namePlural = newItemType.namePlural;
    this._displayName = newItemType.displayName;
    this._schema = newItemType.schema;
    this._options = newItemType.options;
  }
}
