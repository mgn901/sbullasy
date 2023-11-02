import { GroupMemberDirectoryBase } from '../../../models/entities-impl/group-member-directory/GroupMemberDirectoryBase.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { InvalidDataInDatabaseException } from '../../../models/errors/InvalidDataInDatabaseException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isShortSecret } from '../../../models/values/TShortSecret.ts';
import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import {
  TGetFindUniqueArgsFromInclude,
  groupMemberDirectoryInclude,
} from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';
import { MemberFromFindResult } from './MemberFromFindResult.ts';

export class GroupMemberDirectoryFromFindResult extends GroupMemberDirectoryBase {
  public constructor(
    param: TFindResult<
      'groupMemberDirectory',
      TGetFindUniqueArgsFromInclude<typeof groupMemberDirectoryInclude, 'groupMemberDirectory'>,
      TGetFindUniqueArgsFromInclude<typeof groupMemberDirectoryInclude, 'groupMemberDirectory'>
    >,
  ) {
    const { id, invitationCode, members } = param;

    if (!isId<IGroup>(id) || !isShortSecret(invitationCode)) {
      throw new InvalidDataInDatabaseException();
    }

    super({
      id,
      invitationCode,
      members: new ArrayWithDiff(...members.map((member) => new MemberFromFindResult(member))),
    });
  }
}
