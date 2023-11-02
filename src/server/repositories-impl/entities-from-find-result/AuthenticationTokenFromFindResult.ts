import { AuthenticationTokenBase } from '../../../models/entities-impl/user/AuthenticationTokenBase.ts';
import { IAuthenticationToken } from '../../../models/entities/user/IAuthenticationToken.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isLongSecret } from '../../../models/values/TLongSecret.ts';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class AuthenticationTokenFromFindResult extends AuthenticationTokenBase {
  public constructor(
    param: TFindResult<
      'authenticationToken',
      TFindUniqueArgs['authenticationToken'],
      TFindUniqueArgs['authenticationToken']
    >,
  ) {
    const { id, secret, type, createdAt, expiresAt, ownerId, ipAddress, userAgent } = param;

    if (!isId<IAuthenticationToken>(id) || !isLongSecret(secret) || !isId<IUser>(ownerId)) {
      throw new InvalidDataInDatabaseException();
    }

    super({ id, _secret: secret, type, createdAt, expiresAt, ownerId, ipAddress, userAgent });
  }
}
