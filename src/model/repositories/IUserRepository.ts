import type { TResult } from '../../utils/result.ts';
import type { IUserProperties, User } from '../user/User.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IUserRepository {
  getOne<Id extends IUserProperties['id']>(
    param: IUserRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: User<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<Email extends IUserProperties['email']>(
    param: IUserRepositoryGetOneByEmailParams<Email>,
  ): Promise<
    TResult<
      {
        readonly item: User<IUserProperties['id'], Email>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends User, Q extends IDaoRequestQuery<R>>(
    param: IUserRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<User, keyof IUserProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IUserProperties['id']>(
    param: IUserRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IUserRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IUserRepositoryGetOneByIdParams<Id extends IUserProperties['id']> {
  readonly id: Id;
}

export interface IUserRepositoryGetOneByEmailParams<Email extends IUserProperties['email']> {
  readonly email: Email;
}

export interface IUserRepositoryGetManyParams<R extends User, Q extends IDaoRequestQuery<R>> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IUserRepositoryDeleteOneParams<Id extends IUserProperties['id']> {
  readonly id: Id;
}

export interface IUserRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<User>;
}
