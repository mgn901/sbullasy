import { ItemBase } from '../../../models/entities-impl/item/ItemBase.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isItemSchema } from '../../../models/values/TItemSchema.ts';
import { isTitle } from '../../../models/values/TTitle.ts';
import { isTitleForUrl } from '../../../models/values/TTitleForUrl.ts';
import { TGetFindUniqueArgsFromInclude, itemInclude } from '../prisma-utils/include.ts';
import { itemBodyFromFindResult } from '../values-from-find-result/itemBodyFromFindResult.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { GroupProfileSummaryFromFindResult } from './GroupProfileSummaryFromFindResult.ts';
import { ItemTypeSummaryFromFindResult } from './ItemTypeSummaryFromFindResult.ts';
import { isItemTypeOptions } from '../../../models/values/IItemTypeOption.ts';

export class ItemFromFindResult extends ItemBase {
  public constructor(
    params: TFindResult<
      'item',
      TGetFindUniqueArgsFromInclude<typeof itemInclude, 'item'>,
      TGetFindUniqueArgsFromInclude<typeof itemInclude, 'item'>
    >,
  ) {
    const { id, title, titleForUrl, createdAt, updatedAt, publishedAt, owner, type, body } = params;
    const { schema, options } = type;

    if (
      !isId<IItem>(id) ||
      !isTitle(title) ||
      !isTitleForUrl(titleForUrl) ||
      !isItemSchema(schema) ||
      !isItemTypeOptions(options)
    ) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      title,
      titleForUrl,
      createdAt,
      updatedAt,
      owner: new GroupProfileSummaryFromFindResult(owner),
      publishedAt: publishedAt ?? undefined,
      type: new ItemTypeSummaryFromFindResult(type),
      body: itemBodyFromFindResult(body, schema, options),
    });
  }
}
