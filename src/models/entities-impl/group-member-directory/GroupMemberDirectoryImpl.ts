import { ArrayWithDiff } from '../../../utils/array-with-diff/ArrayWithDiff.ts';
import { IGroup } from '../../entities/group/IGroup.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { generateShortSecret } from '../../values/TShortSecret.ts';
import { GroupMemberDirectoryBase } from './GroupMemberDirectoryBase.ts';
import { MemberBase } from './MemberBase.ts';

/**
 * このファイルで用いるための{@linkcode MemberBase}の具象クラス。
 */
class Member extends MemberBase {}

/**
 * {@linkcode GroupMemberDirectoryBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class GroupMemberDirectoryImpl extends GroupMemberDirectoryBase {
  public constructor(group: IGroup, initialMember: IUserProfile) {
    super({
      id: group.id,
      invitationCode: generateShortSecret(),
      members: new ArrayWithDiff(
        new Member({
          user: initialMember,
          type: 'admin',
        }),
      ),
    });
  }
}
