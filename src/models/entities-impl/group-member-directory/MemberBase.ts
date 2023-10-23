import { IMember } from '../../entities/group-member-directory/IMember.ts';

/**
 * {@linkcode IMember}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class MemberBase implements IMember {
  public readonly __brand = 'IMember';

  public readonly groupId: IMember['groupId'];

  public readonly user: IMember['user'];

  public type: IMember['type'];

  public constructor(member: Pick<IMember, 'groupId' | 'user' | 'type'>) {
    this.groupId = member.groupId;
    this.user = member.user;
    this.type = member.type;
  }
}
