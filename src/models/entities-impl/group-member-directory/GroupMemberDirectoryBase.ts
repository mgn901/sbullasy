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
import { generateShortSecret } from '../../values/TShortSecret.ts';
import { MemberBase } from './MemberBase.ts';

/**
 * このファイルで用いるための{@linkcode MemberBase}の具象クラス。
 */
class Member extends MemberBase {}

/**
 * {@linkcode IGroupMemberDirectory}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class GroupMemberDirectoryBase implements IGroupMemberDirectory {
  public readonly __brand = 'IGroupMemberDirectory';

  public readonly id: IGroupMemberDirectory['id'];

  private _invitationCode: IGroupMemberDirectory['invitationCode'];

  private readonly _members: IGroupMemberDirectory['members'];

  public constructor(
    groupMemberDirectory: Pick<IGroupMemberDirectory, 'id' | 'invitationCode' | 'members'>,
  ) {
    this.id = groupMemberDirectory.id;
    this._invitationCode = groupMemberDirectory.invitationCode;
    this._members = groupMemberDirectory.members;
  }

  public get invitationCode() {
    return this._invitationCode;
  }

  public get members() {
    return this._members;
  }

  public resetInvitationCode(groupAdminContext: IGroupAdminContext): void {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    this._invitationCode = generateShortSecret();
  }

  public updateMember(
    userProfile: IUserProfile,
    type: IMember['type'],
    groupAdminContext: IGroupAdminContext,
  ): void {
    this.validateGroupMemberContextOrThrow(groupAdminContext);

    const newMember = new Member({ user: userProfile, type });
    const newMembers = this.members.filter((member) => member.user.id !== userProfile.id);
    this._members.replace(...newMembers, newMember);
  }

  public deleteMember(userId: IMember['user']['id'], groupAdminContext: IGroupAdminContext): void;
  public deleteMember(user: IUser, selfContext: ISelfContext): void;
  public deleteMember(
    userOrUserId: IMember['user']['id'] | IUser,
    selfOrGroupAdminContext: IGroupAdminContext | ISelfContext,
  ): void {
    if (
      typeof userOrUserId === 'string' &&
      selfOrGroupAdminContext.__brand === 'IGroupAdminContext'
    ) {
      this.validateGroupMemberContextOrThrow(selfOrGroupAdminContext);
      this._members.replace(...this.members.filter((member) => member.user.id !== userOrUserId));
    } else if (
      typeof userOrUserId === 'object' &&
      selfOrGroupAdminContext.__brand === 'ISelfContext'
    ) {
      userOrUserId.validateSelfContextOrThrow(selfOrGroupAdminContext);
      this._members.replace(
        ...this._members.filter((member) => member.user.id !== userOrUserId.id),
      );
    }
  }

  public joinByInvitationCode(
    userProfile: IUserProfile,
    invitationCode: IGroupMemberDirectory['invitationCode'],
    selfContext: ISelfContext,
    validUserProfileContext: IValidUserProfileContext,
  ): void {
    userProfile.validateSelfContextOrThrow(selfContext);
    userProfile.validateValidUserProfileContextOrThrow(validUserProfileContext);

    if (invitationCode !== this.invitationCode) {
      throw new InvalidInvitationCodeException('この招待コードは使用できません。');
    }

    this.members.push(
      new Member({
        user: userProfile,
        type: 'default',
      }),
    );
  }

  public validateGroupMemberContextOrThrow(
    context: IGroupAdminContext | IGroupMemberContext,
  ): void {
    if (context.groupId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
