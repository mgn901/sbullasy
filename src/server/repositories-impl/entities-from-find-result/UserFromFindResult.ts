import { UserBase } from '../../../models/entities-impl/user/UserBase.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isEmail } from '../../../models/values/TEmail.ts';
import { isId } from '../../../models/values/TId.ts';
import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { TGetFindUniqueArgsFromInclude, userInclude } from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { AuthenticationTokenFromFindResult } from './AuthenticationTokenFromFindResult.ts';
import { EmailVerificationFromFindResult } from './EmailVerificationFromFindResult.ts';

export class UserFromFindResult extends UserBase {
  public constructor(
    param: TFindResult<
      'user',
      TGetFindUniqueArgsFromInclude<typeof userInclude, 'user'>,
      TGetFindUniqueArgsFromInclude<typeof userInclude, 'user'>
    >,
  ) {
    const { id, email, registeredAt, emailVerifications, tokens } = param;

    if (!isId<IUser>(id) || !isEmail(email)) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      email,
      registeredAt: registeredAt ?? undefined,
      _emailVerifications: new ArrayWithDiff(
        ...emailVerifications.map(
          (emailVerification) => new EmailVerificationFromFindResult(emailVerification),
        ),
      ),
      tokens: new ArrayWithDiff(
        ...tokens.map((token) => new AuthenticationTokenFromFindResult(token)),
      ),
    });
  }
}
