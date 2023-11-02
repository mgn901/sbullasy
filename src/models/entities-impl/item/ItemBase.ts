import { validateByJsonSchema } from '../../../utils/validateByJsonSchema.ts';
import { IItemOwnerContext } from '../../contexts/IItemOwnerContext.ts';
import { IItemType } from '../../entities/item-type/IItemType.ts';
import { IItem } from '../../entities/item/IItem.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';
import { InvalidItemBodyException } from '../../errors/InvalidItemBodyException.ts';

class ItemInternal implements IItem {
  public readonly __brand = 'IItem';

  public readonly id: IItem['id'];

  public readonly title: IItem['title'];

  public readonly titleForUrl: IItem['titleForUrl'];

  public readonly createdAt: IItem['createdAt'];

  public readonly updatedAt: IItem['updatedAt'];

  public readonly publishedAt: IItem['publishedAt'];

  public readonly owner: IItem['owner'];

  public readonly type: IItem['type'];

  public readonly body: IItem['body'];

  public constructor(
    item: Pick<
      IItem,
      | 'id'
      | 'title'
      | 'titleForUrl'
      | 'createdAt'
      | 'updatedAt'
      | 'publishedAt'
      | 'owner'
      | 'type'
      | 'body'
    >,
  ) {
    this.id = item.id;
    this.title = item.title;
    this.titleForUrl = item.titleForUrl;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
    this.publishedAt = item.publishedAt;
    this.owner = item.owner;
    this.type = item.type;
    this.body = item.body;
  }

  public updateItem(
    newItem: Pick<IItem, 'title' | 'titleForUrl' | 'publishedAt' | 'body'>,
    type: IItemType,
    itemOwnerContext: IItemOwnerContext,
  ): IItem {
    this.validateItemOwnerContextOrThrow(itemOwnerContext);

    const now = new Date();

    const { title, titleForUrl, body } = newItem;
    // 公開日時が既に設定されているのに、その日時よりも前の日時を設定しようとしている場合は、
    // 既に設定されている日時を優先する。
    const publishedAt =
      this.publishedAt &&
      newItem.publishedAt &&
      newItem.publishedAt < this.publishedAt &&
      this.publishedAt < now
        ? this.publishedAt
        : newItem.publishedAt;

    const updatedAt = now;

    if (this.type.id !== type.id || !validateByJsonSchema(body, type.schema)) {
      throw new InvalidItemBodyException();
    }

    return new ItemInternal({ ...this, title, titleForUrl, body, publishedAt, updatedAt });
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

/**
 * {@linkcode IItem}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export class ItemBase extends ItemInternal {}
