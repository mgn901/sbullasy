import { GroupBase } from '../../../models/entities-impl/group/GroupBase.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class GroupFromFindResult extends GroupBase {
  public constructor(
    group: NonNullable<TFindResult<'group', TFindUniqueArgs['group'], TFindUniqueArgs['group']>>,
  ) {
    const { id, createdAt, instanceRole } = group;

    if (!isId<GroupFromFindResult>(id)) {
      throw new InvalidDataInDatabaseException();
    }

    super({ id, createdAt, instanceRole });
  }
}
