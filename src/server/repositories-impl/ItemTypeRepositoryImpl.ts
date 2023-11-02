import { IItemType } from '../../models/entities/item-type/IItemType.ts';
import { IItemTypeSummary } from '../../models/entities/item-type/IItemTypeSummary.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IItemTypeRepository } from '../repositories/IItemTypeRepository.ts';
import { IRepositoryGetManyOptions } from '../repositories/IRepositoryGetManyOptions.ts';
import { ItemTypeFromFindResult } from './entities-from-find-result/ItemTypeFromFindResult.ts';
import { ItemTypeSummaryFromFindResult } from './entities-from-find-result/ItemTypeSummaryFromFindResult.ts';
import { orderStringToPrismaOrder } from './orderOptionStringToPrismaOrder.ts';
import { repositoryGetManyOptionsToFindArgs } from './prisma-utils/repositoryGetManyOptionsToFindArgs.ts';
import { TCreateInput, TWhereInput } from './prisma-utils/types.ts';

export class ItemTypeRepositoryImpl implements IItemTypeRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(itemTypeId: IItemType['id']): Promise<IItemType> {
    return this.getOne({ id: itemTypeId });
  }

  public async getOneByNameSingularOrThrow(
    itemTypeNameSingular: IItemType['nameSingular'],
  ): Promise<IItemType> {
    return this.getOne({ nameSingular: itemTypeNameSingular });
  }

  public async getOneByNamePluralOrThrow(
    itemTypeNamePlural: IItemType['namePlural'],
  ): Promise<IItemType> {
    return this.getOne({ namePlural: itemTypeNamePlural });
  }

  public async getOneSummaryByIdOrThrow(itemId: IItemType['id']): Promise<IItemTypeSummary> {
    const result = await this.prisma.itemType.findUnique({
      where: { id: itemId },
    });

    if (!result) {
      throw new NotFoundException();
    }

    return new ItemTypeSummaryFromFindResult(result);
  }

  public async getSummaries(
    options: IRepositoryGetManyOptions<
      'id_asc' | 'nameSingular_asc' | 'namePlural_asc',
      IItemType['id']
    >,
  ): Promise<IItemTypeSummary[]> {
    const results = await this.prisma.itemType.findMany({
      ...repositoryGetManyOptionsToFindArgs(options),
      orderBy: orderStringToPrismaOrder(options.order),
    });

    return results.map((result) => new ItemTypeSummaryFromFindResult(result));
  }

  public async saveOne(itemType: IItemType, override?: boolean): Promise<void> {
    const create = {
      id: itemType.id,
      nameSingular: itemType.nameSingular,
      namePlural: itemType.namePlural,
      displayName: itemType.displayName,
      schema: itemType.schema as object,
      options: itemType.options,
    } satisfies TCreateInput['itemType'];

    if (override) {
      await this.prisma.itemType.upsert({ where: { id: itemType.id }, create, update: create });
    } else {
      await this.prisma.itemType.create({ data: create });
    }
  }

  public async deleteOneById(itemTypeId: IItemType['id']): Promise<void> {
    await this.prisma.itemType.delete({ where: { id: itemTypeId } });
  }

  private async getOne(where: TWhereInput['itemType']): Promise<IItemType> {
    const result = await this.prisma.itemType.findUnique({ where });

    if (!result) {
      throw new NotFoundException();
    }

    return new ItemTypeFromFindResult(result);
  }
}
