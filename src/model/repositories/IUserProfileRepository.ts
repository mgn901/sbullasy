import type { TResult } from '../../utils/result.ts';
import type { IUserProfileProperties, UserProfile } from '../user-profile/UserProfile.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IUserProfileRepository {
  getOne<Id extends IUserProfileProperties['id']>(
    param: IUserProfileRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: UserProfile<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends UserProfile, Q extends IDaoRequestQuery<R>>(
    param: IUserProfileRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<UserProfile, keyof IUserProfileProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IUserProfileProperties['id']>(
    param: IUserProfileRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IUserProfileRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IUserProfileRepositoryGetOneByIdParams<Id extends IUserProfileProperties['id']> {
  readonly id: Id;
}

export interface IUserProfileRepositoryGetManyParams<
  R extends UserProfile,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IUserProfileRepositoryDeleteOneParams<Id extends IUserProfileProperties['id']> {
  readonly id: Id;
}

export interface IUserProfileRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<UserProfile>;
}
