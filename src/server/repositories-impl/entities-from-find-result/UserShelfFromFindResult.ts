import { UserShelfBase } from '../../../models/entities-impl/user-shelf/UserShelfBase.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { TGetFindUniqueArgsFromInclude, userShelfInclude } from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { ItemSummaryFromFindResult } from './ItemSummaryFromFindResult.ts';

export class UserShelfFromFindResult extends UserShelfBase {
  public constructor(
    param: TFindResult<
      'userShelf',
      TGetFindUniqueArgsFromInclude<typeof userShelfInclude, 'userShelf'>,
      TGetFindUniqueArgsFromInclude<typeof userShelfInclude, 'userShelf'>
    >,
  ) {
    const { id, bookmarks } = param;

    if (!isId<IUser>(id)) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      bookmarks: new ArrayWithDiff(
        ...bookmarks.map((bookmark) => new ItemSummaryFromFindResult(bookmark.item)),
      ),
    });
  }
}
