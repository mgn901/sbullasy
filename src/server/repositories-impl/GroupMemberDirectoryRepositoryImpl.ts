import { IGroupMemberDirectory } from '../../models/entities/group-member-directory/IGroupMemberDirectory.ts';
import { IMember } from '../../models/entities/group-member-directory/IMember.ts';
import { compareMember } from '../../models/entities/group-member-directory/compareMember.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import type { PrismaClient } from '../prisma-client';
import { IGroupMemberDirectoryRepository } from '../repositories/IGroupMemberDirectoryRepository.ts';
import { GroupMemberDirectoryFromFindResult } from './entities-from-find-result/GroupMemberDirectoryFromFindResult.ts';
import { groupMemberDirectoryInclude } from './prisma-utils/include.ts';
import { TCreateInput, TFindUniqueArgs, TUpdateInput, TWhereInput } from './prisma-utils/types.ts';

export class GroupMemberDirectoryRepositoryImpl implements IGroupMemberDirectoryRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(
    groupId: IGroupMemberDirectory['id'],
  ): Promise<IGroupMemberDirectory> {
    return this.getOne({ id: groupId });
  }

  public async getOneByInvitationCodeOrThrow(
    invitationCode: IGroupMemberDirectory['invitationCode'],
  ): Promise<IGroupMemberDirectory> {
    return this.getOne({ invitationCode });
  }

  public async saveOne(
    groupMemberDirectory: IGroupMemberDirectory,
    override?: boolean,
  ): Promise<void> {
    const memberToMemberWhereInput = (member: IMember) =>
      ({
        userId_groupId: { userId: member.user.id, groupId: groupMemberDirectory.id },
      }) satisfies TWhereInput['member'];

    const membersDiff = groupMemberDirectory.members.diff(compareMember);

    const membersConnectOrCreate = membersDiff.added.map((member) => ({
      where: memberToMemberWhereInput(member),
      create: { userId: member.user.id, type: member.type, groupId: groupMemberDirectory.id },
      update: { userId: member.user.id, type: member.type, groupId: groupMemberDirectory.id },
    })) satisfies NonNullable<TUpdateInput['groupMemberDirectory']['members']>['connectOrCreate'];

    const create = {
      id: groupMemberDirectory.id,
      invitationCode: groupMemberDirectory.invitationCode,
      members: { connectOrCreate: membersConnectOrCreate },
    } satisfies TCreateInput['groupMemberDirectory'];

    if (override) {
      await this.prisma.groupMemberDirectory.upsert({
        where: { id: groupMemberDirectory.id },
        create,
        update: {
          invitationCode: groupMemberDirectory.invitationCode,
          members: {
            delete: membersDiff.deleted.map(memberToMemberWhereInput),
            connectOrCreate: membersConnectOrCreate,
          },
        },
      });
    } else {
      await this.prisma.groupMemberDirectory.create({ data: create });
    }
  }

  public async deleteOneById(groupId: IGroupMemberDirectory['id']): Promise<void> {
    await this.prisma.groupMemberDirectory.delete({ where: { id: groupId } });
  }

  private async getOne<W extends TFindUniqueArgs['groupMemberDirectory']['where']>(
    where: W,
  ): Promise<IGroupMemberDirectory> {
    const result = await this.prisma.groupMemberDirectory.findUnique({
      include: groupMemberDirectoryInclude,
      where,
    });

    if (!result) {
      throw new NotFoundException();
    }

    return new GroupMemberDirectoryFromFindResult(result);
  }
}
