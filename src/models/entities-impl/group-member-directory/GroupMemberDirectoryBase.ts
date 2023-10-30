import { IGroupAdminContext } from '../../contexts/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../contexts/IGroupMemberContext.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidUserProfileContext } from '../../contexts/IValidUserProfileContext.ts';
import { IGroupMemberDirectory } from '../../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IMember } from '../../entities/group-member-directory/IMember.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';
import { InvalidInvitationCodeException } from '../../errors/InvalidInvitationCodeException.ts';
import { InvalidRequestException } from '../../errors/InvalidRequestException.ts';
import { generateShortSecret } from '../../values/TShortSecret.ts';
import { MemberBase } from './MemberBase.ts';

/**
 * このファイルで用いるための{@linkcode MemberBase}の具象クラス。
 */
class MemberInternal extends MemberBase {}

class GroupMemberDirectoryInternal implements IGroupMemberDirectory {
  public readonly __brand = 'IGroupMemberDirectory';

  public readonly id: IGroupMemberDirectory['id'];

  public readonly invitationCode: IGroupMemberDirectory['invitationCode'];

  public readonly members: IGroupMemberDirectory['members'];

  public constructor(
    groupMemberDirectory: Pick<IGroupMemberDirectory, 'id' | 'invitationCode' | 'members'>,
  ) {
    this.id = groupMemberDirectory.id;
    this.invitationCode = groupMemberDirectory.invitationCode;
    this.members = groupMemberDirectory.members;
  }

  public resetInvitationCode(groupAdminContext: IGroupAdminContext): IGroupMemberDirectory {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    return new GroupMemberDirectoryInternal({ ...this, invitationCode: generateShortSecret() });
  }

  public updateMember(
    userProfile: IUserProfile,
    type: IMember['type'],
    groupAdminContext: IGroupAdminContext,
  ): IGroupMemberDirectory {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    const newMember = new MemberInternal({ user: userProfile, type });
    return new GroupMemberDirectoryInternal({
      ...this,
      members: this.members.toReplaced(
        ...this.members.filter((member) => member.user.id !== userProfile.id),
        newMember,
      ),
    });
  }

  public deleteMember(
    userId: IMember['user']['id'],
    groupAdminContext: IGroupAdminContext,
  ): IGroupMemberDirectory;
  public deleteMember(user: IUser, selfContext: ISelfContext): IGroupMemberDirectory;
  public deleteMember(
    userOrUserId: IMember['user']['id'] | IUser,
    selfOrGroupAdminContext: IGroupAdminContext | ISelfContext,
  ): IGroupMemberDirectory {
    if (
      typeof userOrUserId === 'string' &&
      selfOrGroupAdminContext.__brand === 'IGroupAdminContext'
    ) {
      this.validateGroupMemberContextOrThrow(selfOrGroupAdminContext);
      return new GroupMemberDirectoryInternal({
        ...this,
        members: this.members.toReplaced(
          ...this.members.filter((member) => member.user.id !== userOrUserId),
        ),
      });
    }

    if (typeof userOrUserId === 'object' && selfOrGroupAdminContext.__brand === 'ISelfContext') {
      userOrUserId.validateSelfContextOrThrow(selfOrGroupAdminContext);
      return new GroupMemberDirectoryInternal({
        ...this,
        members: this.members.toReplaced(
          ...this.members.filter((member) => member.user.id !== userOrUserId.id),
        ),
      });
    }

    throw new InvalidRequestException();
  }

  public joinByInvitationCode(
    userProfile: IUserProfile,
    invitationCode: IGroupMemberDirectory['invitationCode'],
    selfContext: ISelfContext,
    validUserProfileContext: IValidUserProfileContext,
  ): IGroupMemberDirectory {
    userProfile.validateSelfContextOrThrow(selfContext);
    userProfile.validateValidUserProfileContextOrThrow(validUserProfileContext);

    if (invitationCode !== this.invitationCode) {
      throw new InvalidInvitationCodeException('この招待コードは使用できません。');
    }

    return new GroupMemberDirectoryInternal({
      ...this,
      members: this.members.toReplaced(
        ...this.members,
        new MemberInternal({ user: userProfile, type: 'default' }),
      ),
    });
  }

  public validateGroupMemberContextOrThrow(
    context: IGroupAdminContext | IGroupMemberContext,
  ): void {
    if (context.groupId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}

/**
 * {@linkcode IGroupMemberDirectory}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupMemberDirectoryBase extends GroupMemberDirectoryInternal {}
