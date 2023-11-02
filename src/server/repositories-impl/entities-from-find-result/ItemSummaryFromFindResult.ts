import { IItem } from '../../../models/entities/item/IItem.ts';
import { IItemSummary } from '../../../models/entities/item/IItemSummary.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isItemSchema } from '../../../models/values/TItemSchema.ts';
import { isTitle } from '../../../models/values/TTitle.ts';
import { isTitleForUrl } from '../../../models/values/TTitleForUrl.ts';
import {
  TGetFindUniqueArgsFromInclude,
  itemIncludeForItemSummary,
} from '../prisma-utils/include.ts';
import { itemBodyFromFindResult } from '../values-from-find-result/itemBodyFromFindResult.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { GroupProfileSummaryFromFindResult } from './GroupProfileSummaryFromFindResult.ts';
import { ItemTypeSummaryFromFindResult } from './ItemTypeSummaryFromFindResult.ts';

export class ItemSummaryFromFindResult implements IItemSummary {
  public readonly __brand = 'IItemSummary';

  public readonly owner: IItemSummary['owner'];

  public readonly id: IItemSummary['id'];

  public readonly type: IItemSummary['type'];

  public readonly title: IItemSummary['title'];

  public readonly titleForUrl: IItemSummary['titleForUrl'];

  public readonly updatedAt: IItemSummary['updatedAt'];

  public readonly publishedAt: IItemSummary['publishedAt'];

  public readonly body: IItemSummary['body'];

  public constructor(
    param: TFindResult<
      'item',
      TGetFindUniqueArgsFromInclude<typeof itemIncludeForItemSummary, 'item'>,
      TGetFindUniqueArgsFromInclude<typeof itemIncludeForItemSummary, 'item'>
    >,
  ) {
    const { id, title, titleForUrl, updatedAt, publishedAt, owner, type, body } = param;
    const { schema } = type;

    if (
      !isId<IItem>(id) ||
      !isTitle(title) ||
      !isTitleForUrl(titleForUrl) ||
      !isItemSchema(schema)
    ) {
      throw new InvalidDataInDatabaseException();
    }

    this.id = id;
    this.title = title;
    this.titleForUrl = titleForUrl;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt ?? undefined;
    this.owner = new GroupProfileSummaryFromFindResult(owner);
    this.type = new ItemTypeSummaryFromFindResult(type);
    this.body = itemBodyFromFindResult(body, schema);
  }
}
