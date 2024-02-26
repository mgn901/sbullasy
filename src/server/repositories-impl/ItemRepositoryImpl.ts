import { IBadge } from '../../models/entities/item/IBadge.ts';
import { IItem } from '../../models/entities/item/IItem.ts';
import { IItemSummary } from '../../models/entities/item/IItemSummary.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IItemRepository } from '../repositories/IItemRepository.ts';
import { IRepositoryGetManyOptions } from '../repositories/IRepositoryGetManyOptions.ts';
import { BadgeFromFindResult } from './entities-from-find-result/BadgeFromFindResult.ts';
import { ItemFromFindResult } from './entities-from-find-result/ItemFromFindResult.ts';
import { ItemSummaryFromFindResult } from './entities-from-find-result/ItemSummaryFromFindResult.ts';
import { orderStringToPrismaOrder } from './orderOptionStringToPrismaOrder.ts';
import { itemInclude, itemIncludeForItemSummary } from './prisma-utils/include.ts';
import { repositoryGetManyOptionsToFindArgs } from './prisma-utils/repositoryGetManyOptionsToFindArgs.ts';
import { TCreateInput, TFindUniqueArgs } from './prisma-utils/types.ts';
import { itemBodyToCreateInput } from './values-to-create-input/itemBodyToCreateInput.ts';

export class ItemRepositoryImpl implements IItemRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(itemId: IItem['id']): Promise<IItem> {
    return this.getOne({ id: itemId });
  }

  public async getOneByTitleForUrlOrThrow(itemTitleForUrl: IItem['titleForUrl']): Promise<IItem> {
    return this.getOne({ titleForUrl: itemTitleForUrl });
  }

  public async getOneSummaryByIdOrThrow(itemId: IItem['id']): Promise<IItemSummary> {
    const result = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: itemIncludeForItemSummary,
    });

    if (!result) {
      throw new NotFoundException();
    }

    return new ItemSummaryFromFindResult(result);
  }

  public async getOneBadgeByIdOrThrow(itemId: IBadge['id']): Promise<IBadge> {
    const result = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { type: true },
    });

    if (!result) {
      throw new NotFoundException();
    }

    return new BadgeFromFindResult(result);
  }

  public async getSummaries(
    options: IRepositoryGetManyOptions<'id_asc' | 'titleForUrl_asc', IItemSummary['id']> & {
      itemTypeId: IItem['type']['id'];
    },
  ): Promise<IItemSummary[]> {
    const results = await this.prisma.item.findMany({
      ...repositoryGetManyOptionsToFindArgs(options),
      where: { typeId: options.itemTypeId },
      orderBy: orderStringToPrismaOrder(options.order),
      include: itemIncludeForItemSummary,
    });

    return results.map((result) => new ItemSummaryFromFindResult(result));
  }

  public async saveOne(item: IItem, override?: boolean): Promise<void> {
    const create = {
      id: item.id,
      title: item.title,
      titleForUrl: item.titleForUrl,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      typeId: item.type.id,
      ownerId: item.owner.id,
      body: { create: itemBodyToCreateInput(item.body) },
    } satisfies TCreateInput['item'];

    if (override) {
      await this.prisma.item.upsert({
        where: { id: item.id },
        create,
        update: {
          ...create,
          body: {
            deleteMany: { parentItemId: item.id },
            create: itemBodyToCreateInput(item.body),
          },
        },
      });
    } else {
      await this.prisma.item.create({ data: create });
    }
  }

  public async deleteOneById(itemId: IItem['id']): Promise<void> {
    await this.prisma.item.delete({ where: { id: itemId } });
  }

  private async getOne(where: TFindUniqueArgs['item']['where']): Promise<IItem> {
    const result = await this.prisma.item.findUnique({ where, include: itemInclude });

    if (!result) {
      throw new NotFoundException();
    }

    return new ItemFromFindResult(result);
  }
}
