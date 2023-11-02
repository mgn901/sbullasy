import { IUserProfile } from '../../models/entities/user-profile/IUserProfile.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IUserProfileRepository } from '../repositories/IUserProfileRepository.ts';
import { UserProfileForPrisma } from './entities-from-find-result/UserProfileFromFindResult.ts';
import { userProfileInclude } from './prisma-utils/include.ts';
import { TCreateInput, TWhereInput } from './prisma-utils/types.ts';

export class UserProfileRepositoryImpl implements IUserProfileRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(userId: IUserProfile['id']): Promise<IUserProfile> {
    return this.getOne({ id: userId });
  }

  public async getOneByNameOrThrow(userName: IUserProfile['name']): Promise<IUserProfile> {
    return this.getOne({ name: userName });
  }

  public async saveOne(userProfile: IUserProfile, override?: boolean): Promise<void> {
    const create = {
      id: userProfile.id,
      name: userProfile.name,
      displayName: userProfile.displayName,
      expiresAt: userProfile.expiresAt ?? undefined,
    } satisfies TCreateInput['userProfile'];

    if (override) {
      await this.prisma.userProfile.upsert({
        where: { id: userProfile.id },
        create,
        update: create,
      });
    } else {
      await this.prisma.userProfile.create({ data: create });
    }
  }

  public async deleteOneById(userId: IUserProfile['id']): Promise<void> {
    await this.prisma.userProfile.delete({ where: { id: userId } });
  }

  private async getOne(where: TWhereInput['userProfile']): Promise<IUserProfile> {
    const result = await this.prisma.userProfile.findUnique({ where, include: userProfileInclude });

    if (!result) {
      throw new NotFoundException();
    }

    return new UserProfileForPrisma(result);
  }
}
