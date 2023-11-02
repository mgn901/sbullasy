import { ItemTypeBase } from '../../../models/entities-impl/item-type/ItemTypeBase.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isItemTypeOptions } from '../../../models/values/IItemTypeOption.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { isItemSchema } from '../../../models/values/TItemSchema.ts';
import { isName } from '../../../models/values/TName.ts';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class ItemTypeFromFindResult extends ItemTypeBase {
  public constructor(
    params: TFindResult<'itemType', TFindUniqueArgs['itemType'], TFindUniqueArgs['itemType']>,
  ) {
    const { id, nameSingular, namePlural, displayName, options, schema } = params;

    if (
      !isId<ItemTypeFromFindResult>(id) ||
      !isName(nameSingular) ||
      !isName(namePlural) ||
      !isDisplayName(displayName) ||
      !isItemSchema(schema) ||
      !isItemTypeOptions(options)
    ) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      nameSingular,
      namePlural,
      displayName,
      options,
      schema,
    });
  }
}
