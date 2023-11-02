import { IItemType } from '../../../models/entities/item-type/IItemType.ts';
import { IItemTypeSummary } from '../../../models/entities/item-type/IItemTypeSummary.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class ItemTypeSummaryFromFindResult implements IItemTypeSummary {
  public readonly __brand = 'IItemTypeSummary';

  public readonly id: IItemTypeSummary['id'];

  public readonly nameSingular: IItemTypeSummary['nameSingular'];

  public readonly namePlural: IItemTypeSummary['namePlural'];

  public readonly displayName: IItemTypeSummary['displayName'];

  public constructor(
    param: TFindResult<'itemType', TFindUniqueArgs['itemType'], TFindUniqueArgs['itemType']>,
  ) {
    const { id, nameSingular, namePlural, displayName } = param;

    if (
      !isId<IItemType>(id) ||
      !isName(nameSingular) ||
      !isName(namePlural) ||
      !isDisplayName(displayName)
    ) {
      throw new InvalidDataInDatabaseException();
    }

    this.id = id;
    this.nameSingular = nameSingular;
    this.namePlural = namePlural;
    this.displayName = displayName;
  }
}
