import { exclude, extract } from '../../utils/predicate.ts';
import { type TShortSecret, generateShortSecret } from '../../utils/random-values/short-secret.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { TExcludeFromTuple } from '../../utils/tuple.ts';
import type {
  IMyselfCertificateProperties,
  MyselfCertificate,
} from '../certificates/MyselfCertificate.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import type { IGroupProperties } from '../group/Group.ts';
import { type UserProfile, UserProfileExpiredException } from '../user-profile/UserProfile.ts';
import { type IMemberProperties, Member } from './Member.ts';

const groupMemberDirectoryTypeSymbol = Symbol('groupMemberDirectoryTypeSymbol');

export interface IGroupMemberDirectoryProperties {
  readonly id: IGroupProperties['id'];
  readonly invitationSecret: TShortSecret;
  readonly members: readonly Member[];
}

export class GroupMemberDirectory<
  Id extends IGroupMemberDirectoryProperties['id'] = IGroupMemberDirectoryProperties['id'],
  InvitationSecret extends
    IGroupMemberDirectoryProperties['invitationSecret'] = IGroupMemberDirectoryProperties['invitationSecret'],
  Members extends
    IGroupMemberDirectoryProperties['members'] = IGroupMemberDirectoryProperties['members'],
> {
  public readonly [groupMemberDirectoryTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly invitationSecret: InvitationSecret;
  public readonly members: Members;

  public toInvitationSecretResetRequestCreated<
    AdminUserId extends IMyselfCertificateProperties['userId'],
  >(param: {
    readonly myselfCertificate: MyselfCertificate<AdminUserId>;
  }): TResult<
    {
      readonly groupMemberDirectory: GroupMemberDirectory<
        Id,
        IGroupMemberDirectoryProperties['invitationSecret'],
        Members
      >;
    },
    NotGroupAdminException
  > {
    if (
      !this.members.some(extract({ userId: param.myselfCertificate.userId, permission: 'admin' }))
    ) {
      return new Failure(
        new NotGroupAdminException({
          message: '管理者以外のメンバーがグループの招待コードをリセットすることはできません。',
        }),
      );
    }

    return new Success({
      groupMemberDirectory: GroupMemberDirectory.fromParam({
        id: this.id,
        members: this.members,
        invitationSecret: generateShortSecret(),
      }),
    });
  }

  public toMemberAdded<UserId extends IMemberProperties['userId']>(param: {
    readonly answer: IGroupMemberDirectoryProperties['invitationSecret'];
    readonly userProfile: UserProfile<UserId>;
    readonly myselfCertificate: MyselfCertificate<UserId>;
  }): TResult<
    {
      readonly groupMemberDirectory: GroupMemberDirectory<
        Id,
        InvitationSecret,
        readonly [...Members, Member<Id, UserId, 'default'>]
      >;
    },
    WrongInvitationSecretException | UserProfileExpiredException
  > {
    if (!param.userProfile.isValidAt({}).value.isValid) {
      return new Failure(
        new UserProfileExpiredException({
          message:
            '学生認証の期限が切れています。グループに参加するには、学生認証を受けてください。',
        }),
      );
    }
    if (this.invitationSecret !== param.answer) {
      return new Failure(
        new WrongInvitationSecretException({ message: '正しい招待コードを入力してください。' }),
      );
    }

    return new Success({
      groupMemberDirectory: GroupMemberDirectory.fromParam({
        id: this.id,
        invitationSecret: this.invitationSecret,
        members: [
          ...this.members,
          Member.fromParam({
            groupId: this.id,
            userId: param.userProfile.id,
            permission: 'default',
          }),
        ] as const,
      }),
    });
  }

  public toMemberRemovedByMyself<UserId extends IMemberProperties['userId']>(param: {
    readonly userId: UserId;
    readonly myselfCertificate: MyselfCertificate<UserId>;
  }): TResult<
    {
      readonly groupMemberDirectory: GroupMemberDirectory<
        Id,
        InvitationSecret,
        TExcludeFromTuple<Members, Member<Id, UserId>>
      >;
    },
    InsufficientAdminsException
  > {
    const newGroupMemberDirectory = GroupMemberDirectory.fromParam({
      id: this.id,
      invitationSecret: this.invitationSecret,
      members: this.members.filter(exclude<Member, Member<Id, UserId>>({ userId: param.userId })),
    });

    if (!newGroupMemberDirectory.members.some(extract({ permission: 'admin' }))) {
      return new Failure(
        new InsufficientAdminsException({
          message:
            'あなたがグループから退出すると、グループから管理者がいなくなります。グループに残る1人以上のメンバーを管理者にしてください。',
        }),
      );
    }

    return new Success({
      groupMemberDirectory: newGroupMemberDirectory,
    });
  }

  public toMemberRemovedByAdmin<UserId extends IMemberProperties['userId']>(param: {
    readonly userId: UserId;
    readonly myselfCertificate: MyselfCertificate<IMyselfCertificateProperties['userId']>;
  }): TResult<
    {
      readonly groupMemberDirectory: GroupMemberDirectory<
        Id,
        InvitationSecret,
        TExcludeFromTuple<Members, Member<Id, UserId>>
      >;
    },
    NotGroupAdminException
  > {
    if (
      !this.members.some(extract({ userId: param.myselfCertificate.userId, permission: 'admin' }))
    ) {
      return new Failure(
        new NotGroupAdminException({
          message: '管理者以外のメンバーが他のメンバーをグループから退出させることはできません。',
        }),
      );
    }

    return new Success({
      groupMemberDirectory: GroupMemberDirectory.fromParam({
        id: this.id,
        invitationSecret: this.invitationSecret,
        members: this.members.filter(exclude<Member, Member<Id, UserId>>({ userId: param.userId })),
      }),
    });
  }

  public static fromParam<
    Id extends IGroupMemberDirectoryProperties['id'],
    InvitationSecret extends IGroupMemberDirectoryProperties['invitationSecret'],
    Members extends IGroupMemberDirectoryProperties['members'],
  >(
    param: Pick<
      GroupMemberDirectory<Id, InvitationSecret, Members>,
      keyof IGroupMemberDirectoryProperties
    >,
  ): GroupMemberDirectory<Id, InvitationSecret, Members> {
    return new GroupMemberDirectory(param);
  }

  private constructor(
    param: Pick<
      GroupMemberDirectory<Id, InvitationSecret, Members>,
      keyof IGroupMemberDirectoryProperties
    >,
  ) {
    this.id = param.id;
    this.invitationSecret = param.invitationSecret;
    this.members = param.members;
  }
}

export class NotGroupAdminException extends ApplicationErrorOrException {
  public readonly name = 'NotGroupAdminException';
}

export class NotGroupMemberException extends ApplicationErrorOrException {
  public readonly name = 'NotGroupMemberException';
}

export class WrongInvitationSecretException extends ApplicationErrorOrException {
  public readonly name = 'WrongInvitationSecretException';
}

export class InsufficientAdminsException extends ApplicationErrorOrException {
  public readonly name = 'InsufficientAdminsException';
}
