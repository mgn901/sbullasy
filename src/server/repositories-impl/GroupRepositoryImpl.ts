import { IGroup } from '../../models/entities/group/IGroup.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IGroupRepository } from '../repositories/IGroupRepository.ts';
import { IRepositoryGetManyOptions } from '../repositories/IRepositoryGetManyOptions.ts';
import { GroupFromFindResult } from './entities-from-find-result/GroupFromFindResult.ts';
import { orderStringToPrismaOrder } from './orderOptionStringToPrismaOrder.ts';
import { repositoryGetManyOptionsToFindArgs } from './prisma-utils/repositoryGetManyOptionsToFindArgs.ts';
import { TCreateInput, TFindUniqueArgs, TUpdateInput } from './prisma-utils/types.ts';

export class GroupRepositoryImpl implements IGroupRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(groupId: IGroup['id']): Promise<IGroup> {
    return this.getOne({ id: groupId });
  }

  public async getMany(
    options: IRepositoryGetManyOptions<'id_asc', IGroup['id']>,
  ): Promise<IGroup[]> {
    const results = await this.prisma.group.findMany({
      ...repositoryGetManyOptionsToFindArgs(options),
      orderBy: orderStringToPrismaOrder(options.order),
    });

    return results.map((result) => new GroupFromFindResult(result));
  }

  public async saveOne(group: IGroup, override?: boolean): Promise<void> {
    const create = {
      id: group.id,
      createdAt: group.createdAt,
      instanceRole: group.instanceRole,
    } satisfies TCreateInput['group'] | TUpdateInput['group'];

    if (override) {
      await this.prisma.group.upsert({ where: { id: group.id }, create, update: create });
    } else {
      await this.prisma.group.create({ data: create });
    }
  }

  public async deleteOneById(groupId: IGroup['id']): Promise<void> {
    await this.prisma.group.delete({ where: { id: groupId } });
  }

  private async getOne(where: TFindUniqueArgs['group']['where']): Promise<IGroup> {
    const result = await this.prisma.group.findUnique({ where });

    if (!result) {
      throw new NotFoundException();
    }

    return new GroupFromFindResult(result);
  }
}
