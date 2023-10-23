import { IItemOwnerContext } from '../../contexts/IItemOwnerContext.ts';
import { IItem } from '../../entities/item/IItem.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

/**
 * {@linkcode IItem}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class ItemBase implements IItem {
  public readonly __brand = 'IItem';

  public readonly id: IItem['id'];

  private _displayName: IItem['displayName'];

  public readonly createdAt: IItem['createdAt'];

  private _updatedAt: IItem['updatedAt'];

  private _publishedAt: IItem['publishedAt'];

  public readonly owner: IItem['owner'];

  public readonly type: IItem['type'];

  private _body: IItem['body'];

  public constructor(
    item: Pick<
      IItem,
      'id' | 'displayName' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'owner' | 'type' | 'body'
    >,
  ) {
    this.id = item.id;
    this._displayName = item.displayName;
    this.createdAt = item.createdAt;
    this._updatedAt = item.updatedAt;
    this._publishedAt = item.publishedAt;
    this.owner = item.owner;
    this.type = item.type;
    this._body = item.body;
  }

  public get displayName() {
    return this._displayName;
  }

  public get updatedAt() {
    return this._updatedAt;
  }

  public get publishedAt() {
    return this._publishedAt;
  }

  public get body() {
    return this._body;
  }

  public updateItem(
    newItem: Pick<IItem, 'displayName' | 'publishedAt' | 'body'>,
    itemOwnerContext: IItemOwnerContext,
  ): void {
    this.validateItemOwnerContextOrThrow(itemOwnerContext);

    const now = new Date();

    this._displayName = newItem.displayName;
    this._publishedAt = (() => {
      // 公開日時が既に設定されているのに、その日時よりも前の日時を設定しようとしている場合は、既に設定されている日時を優先する。
      if (
        this.publishedAt &&
        newItem.publishedAt &&
        newItem.publishedAt < this.publishedAt &&
        this.publishedAt < now
      ) {
        return this.publishedAt;
      }
      return newItem.publishedAt;
    })();
    this._body = newItem.body;

    this._updatedAt = now;
  }

  public isPublishedAt(date: Date): boolean {
    return !!this.publishedAt && date > this.publishedAt;
  }

  public validateItemOwnerContextOrThrow(context: IItemOwnerContext): void {
    if (context.itemId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
