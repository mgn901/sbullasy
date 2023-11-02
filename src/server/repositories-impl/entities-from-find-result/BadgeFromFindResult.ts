import { IBadge } from '../../../models/entities/item/IBadge.ts';
import { IItem } from '../../../models/entities/item/IItem.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isTitle } from '../../../models/values/TTitle.ts';
import { isTitleForUrl } from '../../../models/values/TTitleForUrl.ts';
import { TGetFindUniqueArgsFromInclude, badgeInclude } from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { ItemTypeSummaryFromFindResult } from './ItemTypeSummaryFromFindResult.ts';

export class BadgeFromFindResult implements IBadge {
  public readonly __brand = 'IBadge';

  public readonly id: IBadge['id'];

  public readonly type: IBadge['type'];

  public readonly title: IBadge['title'];

  public readonly titleForUrl: IBadge['titleForUrl'];

  public constructor(
    param: TFindResult<
      'badge',
      TGetFindUniqueArgsFromInclude<typeof badgeInclude, 'badge'>,
      TGetFindUniqueArgsFromInclude<typeof badgeInclude, 'badge'>
    >['item'],
  ) {
    const { id, title, titleForUrl, type } = param;

    if (!isId<IItem>(id) || !isTitle(title) || !isTitleForUrl(titleForUrl)) {
      throw new InvalidDataInDatabaseException();
    }

    this.id = id;
    this.title = title;
    this.titleForUrl = titleForUrl;
    this.type = new ItemTypeSummaryFromFindResult(type);
  }
}
