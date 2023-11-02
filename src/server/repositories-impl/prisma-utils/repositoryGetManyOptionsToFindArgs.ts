import { IRepositoryGetManyOptions } from '../../repositories/IRepositoryGetManyOptions.ts';

export const repositoryGetManyOptionsToFindArgs = <O extends string, C extends string>(
  options: IRepositoryGetManyOptions<O, C>,
) => ({
  take: options.limit,
  skip: options.offset,
  cursor: { id: options.cursor },
});
