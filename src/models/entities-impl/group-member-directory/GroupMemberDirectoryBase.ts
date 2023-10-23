import { IGroupAdminContext } from '../../context/IGroupAdminContext.ts';
import { IGroupMemberContext } from '../../context/IGroupMemberContext.ts';
import { ISelfContext } from '../../context/ISelfContext.ts';
import { IValidUserProfileContext } from '../../context/IValidUserProfileContext.ts';
import { IGroupMemberDirectory } from '../../entities/group-member-directory/IGroupMemberDirectory.ts';
import { IMember } from '../../entities/group-member-directory/IMember.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
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

  public setMembers(newMembers: IMember[], groupAdminContext: IGroupAdminContext): void {
    this.validateGroupMemberContextOrThrow(groupAdminContext);
    this._members.replace(...newMembers);
  }

  public joinByInvitationCode(
    userProfile: IUserProfile,
    invitationCode: IGroupMemberDirectory['invitationCode'],
    selfContext: ISelfContext,
    validUserProfileContext: IValidUserProfileContext,
  ): void {
    userProfile.validateSelfContextOrThrow(selfContext);

    if (userProfile.id !== validUserProfileContext.userId) {
      throw new InternalContextValidationError();
    }

    if (invitationCode !== this.invitationCode) {
      throw new InvalidInvitationCodeException('この招待コードは使用できません。');
    }

    this.members.push(
      new Member({
        groupId: this.id,
        type: 'default',
        user: userProfile,
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
