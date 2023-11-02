import { compareItem } from '../../models/entities/item/compareItem.ts';
import { IUserShelf } from '../../models/entities/user-shelf/IUserShelf.ts';
import { InvalidDataInDatabaseException } from '../../models/errors/InvalidDataInDatabaseException.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IUserShelfRepository } from '../repositories/IUserShelfRepository.ts';
import { UserShelfFromFindResult } from './entities-from-find-result/UserShelfFromFindResult.ts';
import { userShelfInclude } from './prisma-utils/include.ts';
import { TCreateInput, TWhereInput } from './prisma-utils/types.ts';

export class UserShelfRepositoryImpl implements IUserShelfRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(userId: IUserShelf['id']): Promise<IUserShelf> {
    return this.getOne({ id: userId });
  }

  public async saveOne(userShelf: IUserShelf, override?: boolean): Promise<void> {
    const bookmarksDiff = userShelf.bookmarks.diff(compareItem);

    const bookmarkToWhereInput = (bookmark: IUserShelf['bookmarks'][number]) =>
      ({
        ownerId_itemId: { ownerId: userShelf.id, itemId: bookmark.id },
      }) satisfies TWhereInput['bookmark'];

    const boookmarksConnect = bookmarksDiff.added.map(bookmarkToWhereInput) satisfies NonNullable<
      TCreateInput['userShelf']['bookmarks']
    >['connect'];

    const create = {
      id: userShelf.id,
      bookmarks: { connect: boookmarksConnect },
    } satisfies TCreateInput['userShelf'];

    if (override) {
      await this.prisma.userShelf.upsert({
        where: { id: userShelf.id },
        create,
        update: {
          ...create,
          bookmarks: {
            connect: boookmarksConnect,
            disconnect: bookmarksDiff.deleted.map(bookmarkToWhereInput),
          },
        },
      });
    } else {
      await this.prisma.userShelf.create({ data: create });
    }
  }

  public async deleteOneById(userId: IUserShelf['id']): Promise<void> {
    await this.prisma.userShelf.delete({ where: { id: userId } });
  }

  private async getOne(where: TWhereInput['userShelf']): Promise<IUserShelf> {
    const result = await this.prisma.userShelf.findUnique({ where, include: userShelfInclude });

    if (!result) {
      throw new InvalidDataInDatabaseException();
    }

    return new UserShelfFromFindResult(result);
  }
}
