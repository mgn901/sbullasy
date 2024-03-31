import type { TResult } from '../../utils/result.ts';
import type { Member } from '../group-member-directory/Member.ts';
import type { DaoException, IDaoRequestOptions, IDaoRequestQuery } from './dao-types.ts';

export interface IMemberRepository {
  getMany<R extends Member, Q extends IDaoRequestQuery<R>>(
    param: IMemberRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;
}

export interface IMemberRepositoryGetManyParams<R extends Member, Q extends IDaoRequestQuery<R>> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}
