import { UserProfileBase } from '../../../models/entities-impl/user-profile/UserProfileBase.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isDisplayName } from '../../../models/values/TDisplayName.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class UserProfileForPrisma extends UserProfileBase {
  public constructor(
    param: TFindResult<
      'userProfile',
      TFindUniqueArgs['userProfile'],
      TFindUniqueArgs['userProfile']
    >,
  ) {
    const { id, name, displayName, expiresAt } = param;

    if (!isId<IUser>(id) || !isName(name) || !isDisplayName(displayName)) {
      throw new InvalidDataInDatabaseException();
    }

    super({ id, name, displayName, expiresAt: expiresAt ?? undefined, belongsTo: [] });
  }
}
