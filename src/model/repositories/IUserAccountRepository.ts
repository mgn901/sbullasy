import type { TResult } from '../../utils/result.ts';
import type { IUserAccountProperties, UserAccount } from '../user-account/UserAccount.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IUserAccountRepository {
  getOne<Id extends IUserAccountProperties['id']>(
    param: IUserAccountRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: UserAccount<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends UserAccount, Q extends IDaoRequestQuery<R>>(
    param: IUserAccountRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<UserAccount, keyof IUserAccountProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IUserAccountProperties['id']>(
    param: IUserAccountRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IUserAccountRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IUserAccountRepositoryGetOneByIdParams<Id extends IUserAccountProperties['id']> {
  readonly id: Id;
}

export interface IUserAccountRepositoryGetManyParams<
  R extends UserAccount,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IUserAccountRepositoryDeleteOneParams<Id extends IUserAccountProperties['id']> {
  readonly id: Id;
}

export interface IUserAccountRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<UserAccount>;
}
