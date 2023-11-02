import { EmailVerificationBase } from '../../../models/entities-impl/user/EmailVerificationBase.ts';
import { IEmailVerification } from '../../../models/entities/user/IEmailVerification.ts';
import { IUser } from '../../../models/entities/user/IUser.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isEmail } from '../../../models/values/TEmail.ts';
import { isId } from '../../../models/values/TId.ts';
import { isShortSecret } from '../../../models/values/TShortSecret.ts';
import { EmailVerificationPurpose } from '../../prisma-client/index';
import { TFindResult, TFindUniqueArgs } from '../prisma-utils/types.ts';

export class EmailVerificationFromFindResult extends EmailVerificationBase<EmailVerificationPurpose> {
  public constructor(
    param: TFindResult<
      'emailVerification',
      TFindUniqueArgs['emailVerification'],
      TFindUniqueArgs['emailVerification']
    >,
  ) {
    const { id, secret, email, for: purpose, createdAt, expiresAt, userId } = param;

    if (
      !isId<IEmailVerification<EmailVerificationPurpose>>(id) ||
      !isShortSecret(secret) ||
      !isEmail(email) ||
      !isId<IUser>(userId)
    ) {
      throw new InvalidDataInDatabaseException();
    }

    super({ id, _secret: secret, email, for: purpose, createdAt, expiresAt, userId });
  }
}
