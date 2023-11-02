import { IGroupProfile } from '../../models/entities/group-profile/IGroupProfile.ts';
import { IGroupProfileSummary } from '../../models/entities/group-profile/IGroupProfileSummary.ts';
import { IGroup } from '../../models/entities/group/IGroup.ts';
import { IItemType } from '../../models/entities/item-type/IItemType.ts';
import { IItemTypeSummary } from '../../models/entities/item-type/IItemTypeSummary.ts';
import { compareItemType } from '../../models/entities/item-type/compareItemType.ts';
import { IBadge } from '../../models/entities/item/IBadge.ts';
import { IItem } from '../../models/entities/item/IItem.ts';
import { IItemSummary } from '../../models/entities/item/IItemSummary.ts';
import { compareBadge } from '../../models/entities/item/compareBadge.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import { isDisplayName } from '../../models/values/TDisplayName.ts';
import { isId } from '../../models/values/TId.ts';
import { isName } from '../../models/values/TName.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IGroupProfileRepository } from '../repositories/IGroupProfileRepository.ts';
import { IRepositoryGetManyOptions } from '../repositories/IRepositoryGetManyOptions.ts';
import { GroupProfileFromFindResult } from './entities-from-find-result/GroupProfileFromFindResult.ts';
import { GroupProfileSummaryFromFindResult } from './entities-from-find-result/GroupProfileSummaryFromFindResult.ts';
import { orderStringToPrismaOrder } from './orderOptionStringToPrismaOrder.ts';
import {
  groupProfileInclude,
  groupProfileIncludeForGroupProfileSummary,
} from './prisma-utils/include.ts';
import { repositoryGetManyOptionsToFindArgs } from './prisma-utils/repositoryGetManyOptionsToFindArgs.ts';
import { TCreateInput, TFindUniqueArgs, TUpdateInput, TWhereInput } from './prisma-utils/types.ts';

export class GroupProfileRepositoryImpl implements IGroupProfileRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(groupId: IGroupProfile['id']): Promise<IGroupProfile> {
    return this.getOne({ id: groupId });
  }

  public async getOneByNameOrThrow(groupName: IGroupProfile['name']): Promise<IGroupProfile> {
    return this.getOne({ name: groupName });
  }

  public async getOneSummaryByIdOrThrow(
    groupId: IGroupProfileSummary['id'],
  ): Promise<IGroupProfileSummary> {
    const result = await this.prisma.groupProfile.findUnique({
      where: { id: groupId },
      include: groupProfileIncludeForGroupProfileSummary,
    });

    if (!result) {
      throw new NotFoundException();
    }

    return new GroupProfileSummaryFromFindResult(result);
  }

  public async getSummaries(
    options: IRepositoryGetManyOptions<'id_asc' | 'name_asc', IGroupProfile['id']>,
  ): Promise<IGroupProfileSummary[]> {
    const results = await this.prisma.groupProfile.findMany({
      ...repositoryGetManyOptionsToFindArgs(options),
      orderBy: orderStringToPrismaOrder(options.order),
      include: groupProfileIncludeForGroupProfileSummary,
    });

    return results.map((result) => new GroupProfileSummaryFromFindResult(result));
  }

  public async saveOne(groupProfile: IGroupProfile, override?: boolean): Promise<void> {
    const itemToBadgeWhereInput = (item: IItem | IItemSummary | IBadge) =>
      ({
        grantsToId_itemId: { grantsToId: groupProfile.id, itemId: item.id },
      }) satisfies TWhereInput['badge'];

    const itemTypeToPermissionWhereInput = (itemType: IItemType | IItemTypeSummary | IBadge) =>
      ({
        grantsToId_itemTypeId: { grantsToId: groupProfile.id, itemTypeId: itemType.id },
      }) satisfies TWhereInput['permission'];

    const badgesDiff = groupProfile.badges.diff(compareBadge);

    const editableItemTypesDiff = groupProfile.editableItemTypes.diff(compareItemType);

    const badgesConnect = badgesDiff.added.map(itemToBadgeWhereInput) satisfies NonNullable<
      TUpdateInput['groupProfile']['badges']
    >['connect'];

    const editableItemTypesConnect = editableItemTypesDiff.deleted.map(
      itemTypeToPermissionWhereInput,
    ) satisfies NonNullable<TUpdateInput['groupProfile']['editableItemTypes']>['connect'];

    const create = {
      id: groupProfile.id,
      name: groupProfile.name,
      displayName: groupProfile.displayName,
      badges: { connect: badgesConnect },
      editableItemTypes: { connect: editableItemTypesConnect },
    } satisfies TCreateInput['groupProfile'];

    if (override) {
      await this.prisma.groupProfile.upsert({
        where: { id: groupProfile.id },
        create,
        update: {
          name: groupProfile.name,
          displayName: groupProfile.displayName,
          badges: {
            connect: badgesConnect,
            disconnect: badgesDiff.deleted.map(itemToBadgeWhereInput),
          },
          editableItemTypes: {
            connect: editableItemTypesConnect,
            disconnect: editableItemTypesDiff.deleted.map(itemTypeToPermissionWhereInput),
          },
        },
      });
    } else {
      await this.prisma.groupProfile.create({ data: create });
    }
  }

  public async deleteOneById(groupId: IGroupProfile['id']): Promise<void> {
    await this.prisma.groupProfile.delete({ where: { id: groupId } });
  }

  private async getOne(where: TFindUniqueArgs['groupProfile']['where']): Promise<IGroupProfile> {
    const result = await this.prisma.groupProfile.findUnique({
      include: groupProfileInclude,
      where,
    });

    if (
      !result ||
      !isId<IGroup>(result.id) ||
      !isName(result.name) ||
      !isDisplayName(result.displayName)
    ) {
      throw new NotFoundException();
    }

    return new GroupProfileFromFindResult(result);
  }
}
