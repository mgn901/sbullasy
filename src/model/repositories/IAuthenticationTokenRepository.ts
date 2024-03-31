import type { TResult } from '../../utils/result.ts';
import type {
  AuthenticationToken,
  IAuthenticationTokenProperties,
} from '../user-account/AuthenticationToken.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface IAuthenticationTokenRepository {
  getOne<Id extends IAuthenticationTokenProperties['id']>(
    param: IAuthenticationTokenRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: AuthenticationToken<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<Secret extends IAuthenticationTokenProperties['secret']>(
    param: IAuthenticationTokenRepositoryGetOneBySecretParams<Secret>,
  ): Promise<
    TResult<
      {
        readonly item: AuthenticationToken<
          IAuthenticationTokenProperties['id'],
          IAuthenticationTokenProperties['userId'],
          Secret
        >;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends AuthenticationToken, Q extends IDaoRequestQuery<R>>(
    param: IAuthenticationTokenRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;
}

export interface IAuthenticationTokenRepositoryGetManyParams<
  R extends AuthenticationToken,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface IAuthenticationTokenRepositoryGetOneByIdParams<
  Id extends IAuthenticationTokenProperties['id'],
> {
  readonly id: Id;
}

export interface IAuthenticationTokenRepositoryGetOneBySecretParams<
  Secret extends IAuthenticationTokenProperties['secret'],
> {
  readonly secret: Secret;
}
