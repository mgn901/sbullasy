import { MemberBase } from '../../../models/entities-impl/group-member-directory/MemberBase.ts';
import { TGetFindUniqueArgsFromInclude, memberInclude } from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { UserProfileForPrisma } from './UserProfileFromFindResult.ts';

export class MemberFromFindResult extends MemberBase {
  public constructor(
    param: TFindResult<
      'member',
      TGetFindUniqueArgsFromInclude<typeof memberInclude, 'member'>,
      TGetFindUniqueArgsFromInclude<typeof memberInclude, 'member'>
    >,
  ) {
    const { type, user } = param;
    super({ type, user: new UserProfileForPrisma(user) });
  }
}
