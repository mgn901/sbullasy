import { GroupProfileBase } from '../../../models/entities-impl/group-profile/GroupProfileBase.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { groupProfileInclude, TGetFindUniqueArgsFromInclude } from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { BadgeFromFindResult } from './BadgeFromFindResult.ts';
import { ItemSummaryFromFindResult } from './ItemSummaryFromFindResult.ts';
import { ItemTypeSummaryFromFindResult } from './ItemTypeSummaryFromFindResult.ts';

export class GroupProfileFromFindResult extends GroupProfileBase {
  constructor(
    params: TFindResult<
      'groupProfile',
      TGetFindUniqueArgsFromInclude<typeof groupProfileInclude, 'groupProfile'>,
      TGetFindUniqueArgsFromInclude<typeof groupProfileInclude, 'groupProfile'>
    >,
  ) {
    const { id, name, displayName, badges, editableItemTypes, items } = params;

    if (!isId<IGroup>(id) || !isName(name) || !isDisplayName(displayName)) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      name,
      displayName,
      badges: new ArrayWithDiff(...badges.map((badge) => new BadgeFromFindResult(badge.item))),
      editableItemTypes: new ArrayWithDiff(
        ...editableItemTypes.map(
          (permission) => new ItemTypeSummaryFromFindResult(permission.itemType),
        ),
      ),
      items: new ArrayWithDiff(...items.map((item) => new ItemSummaryFromFindResult(item))),
    });
  }
}
