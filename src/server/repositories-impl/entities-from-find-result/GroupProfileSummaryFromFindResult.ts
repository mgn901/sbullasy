import { IGroupProfileSummary } from '../../../models/entities/group-profile/IGroupProfileSummary.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import {
  TGetFindUniqueArgsFromInclude,
  groupProfileIncludeForGroupProfileSummary,
} from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { BadgeFromFindResult } from './BadgeFromFindResult.ts';

export class GroupProfileSummaryFromFindResult implements IGroupProfileSummary {
  public readonly __brand = 'IGroupProfileSummary';

  public readonly id: IGroupProfileSummary['id'];

  public readonly name: IGroupProfileSummary['name'];

  public readonly displayName: IGroupProfileSummary['displayName'];

  public readonly badges: IGroupProfileSummary['badges'];

  public constructor(
    param: TFindResult<
      'groupProfile',
      TGetFindUniqueArgsFromInclude<
        typeof groupProfileIncludeForGroupProfileSummary,
        'groupProfile'
      >,
      TGetFindUniqueArgsFromInclude<
        typeof groupProfileIncludeForGroupProfileSummary,
        'groupProfile'
      >
    >,
  ) {
    const { id, name, displayName, badges } = param;

    if (!isId<IGroup>(id) || !isName(name) || !isDisplayName(displayName)) {
      throw new InvalidDataInDatabaseException();
    }

    this.id = id;
    this.name = name;
    this.displayName = displayName;
    this.badges = new ArrayWithDiff(...badges.map((badge) => new BadgeFromFindResult(badge.item)));
  }
}
