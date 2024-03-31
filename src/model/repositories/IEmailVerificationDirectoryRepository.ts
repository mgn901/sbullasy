import type { TResult } from '../../utils/result.ts';
import type {
  EmailVerificationDirectory,
  IEmailVerificationDirectoryProperties,
} from '../user-email-verification-directory/EmailVerificationDirectory.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IEmailVerificationDirectoryRepository {
  getOne<Id extends IEmailVerificationDirectoryProperties['id']>(
    param: IEmailVerificationDirectoryRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: EmailVerificationDirectory<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends EmailVerificationDirectory, Q extends IDaoRequestQuery<R>>(
    param: IEmailVerificationDirectoryRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<EmailVerificationDirectory, keyof IEmailVerificationDirectoryProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends IEmailVerificationDirectoryProperties['id']>(
    param: IEmailVerificationDirectoryRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: IEmailVerificationDirectoryRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface IEmailVerificationDirectoryRepositoryGetOneByIdParams<
  Id extends IEmailVerificationDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IEmailVerificationDirectoryRepositoryGetManyParams<
  R extends EmailVerificationDirectory,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IEmailVerificationDirectoryRepositoryDeleteOneParams<
  Id extends IEmailVerificationDirectoryProperties['id'],
> {
  readonly id: Id;
}

export interface IEmailVerificationDirectoryRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<EmailVerificationDirectory>;
}
