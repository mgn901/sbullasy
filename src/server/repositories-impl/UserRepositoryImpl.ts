import { IAuthenticationToken } from '../../models/entities/user/IAuthenticationToken.ts';
import { IEmailVerification } from '../../models/entities/user/IEmailVerification.ts';
import { IUser } from '../../models/entities/user/IUser.ts';
import { compareAuthenticationToken } from '../../models/entities/user/compareAuthenticationToken.ts';
import { compareEmailVerification } from '../../models/entities/user/compareEmailVerification.ts';
import { NotFoundException } from '../../models/errors/NotFoundException.ts';
import { TEmailVerificationPurpose } from '../../models/values/TEmailVerificationPurpose.ts';
import { TLongSecret } from '../../models/values/TLongSecret.ts';
import type { PrismaClient } from '../prisma-client/index';
import { IRepositoryGetManyOptions } from '../repositories/IRepositoryGetManyOptions.ts';
import { IUserRepository } from '../repositories/IUserRepository.ts';
import { UserFromFindResult } from './entities-from-find-result/UserFromFindResult.ts';
import { orderStringToPrismaOrder } from './orderOptionStringToPrismaOrder.ts';
import { userInclude } from './prisma-utils/include.ts';
import { repositoryGetManyOptionsToFindArgs } from './prisma-utils/repositoryGetManyOptionsToFindArgs.ts';
import { TCreateInput, TWhereInput } from './prisma-utils/types.ts';

export class UserRepositoryImpl implements IUserRepository {
  private readonly prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getOneByIdOrThrow(userId: IUser['id']): Promise<IUser> {
    return this.getOne({ id: userId });
  }

  public async getOneByEmailOrThrow(userEmail: IUser['email']): Promise<IUser> {
    return this.getOne({ email: userEmail });
  }

  public async getOneByAuthenticationTokenSecretOrThrow(
    authenticationTokenSecret: TLongSecret,
  ): Promise<IUser> {
    const token = await this.prisma.authenticationToken.findUnique({
      where: { secret: authenticationTokenSecret },
      include: { owner: { include: userInclude } },
    });

    if (!token) {
      throw new NotFoundException();
    }

    return new UserFromFindResult(token.owner);
  }

  public async getMany(
    options: IRepositoryGetManyOptions<'id_asc' | 'email_asc', IUser['id']>,
  ): Promise<IUser[]> {
    const results = await this.prisma.user.findMany({
      ...repositoryGetManyOptionsToFindArgs(options),
      orderBy: orderStringToPrismaOrder(options.order),
      include: userInclude,
    });

    return results.map((result) => new UserFromFindResult(result));
  }

  public async saveOne(user: IUser, override?: boolean): Promise<void> {
    const emailVerificationsDiff = user
      .dangerouslyGetEmailVerifications()
      .diff(compareEmailVerification);

    const tokensDiff = user.tokens.diff(compareAuthenticationToken);

    const verificationToCreateInput = (
      verification: IEmailVerification<TEmailVerificationPurpose>,
    ) =>
      ({
        id: verification.id,
        email: verification.email,
        createdAt: verification.createdAt,
        expiresAt: verification.expiresAt,
        for: verification.for,
        secret: verification.dangerouslyGetSecret(),
      }) satisfies NonNullable<TCreateInput['user']['emailVerifications']>['create'];

    const verificationToWhereInput = (
      verification: IEmailVerification<TEmailVerificationPurpose>,
    ) => ({ id: verification.id }) satisfies TWhereInput['emailVerification'];

    const tokenToCreateInput = (token: IAuthenticationToken) =>
      ({
        id: token.id,
        secret: token.dangerouslyGetSecret(),
        type: token.type,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        ipAddress: token.ipAddress,
        userAgent: token.userAgent,
      }) satisfies NonNullable<TCreateInput['user']['tokens']>['create'];

    const tokenToWhereInput = (token: IAuthenticationToken) =>
      ({ id: token.id }) satisfies TWhereInput['authenticationToken'];

    const emailVerificationsCreate = emailVerificationsDiff.added.map(
      verificationToCreateInput,
    ) satisfies NonNullable<TCreateInput['user']['emailVerifications']>['create'];

    const tokensCreate = tokensDiff.added.map(tokenToCreateInput) satisfies NonNullable<
      TCreateInput['user']['tokens']
    >['create'];

    const create = {
      id: user.id,
      email: user.email,
      registeredAt: user.registeredAt,
      emailVerifications: { create: emailVerificationsCreate },
      tokens: { create: tokensCreate },
    } satisfies TCreateInput['user'];

    if (override) {
      await this.prisma.user.upsert({
        where: { id: user.id },
        create,
        update: {
          ...create,
          emailVerifications: {
            delete: emailVerificationsDiff.deleted.map(verificationToWhereInput),
            create: emailVerificationsCreate,
          },
          tokens: { delete: tokensDiff.deleted.map(tokenToWhereInput), create: tokensCreate },
        },
      });
    } else {
      await this.prisma.user.create({ data: create });
    }
  }

  public async deleteOneById(userId: IUser['id']): Promise<void> {
    this.prisma.user.delete({ where: { id: userId } });
  }

  private async getOne(where: TWhereInput['user']): Promise<IUser> {
    const result = await this.prisma.user.findUnique({ where, include: userInclude });
    if (!result) {
      throw new NotFoundException();
    }
    return new UserFromFindResult(result);
  }
}
