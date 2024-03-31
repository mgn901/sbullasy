import type { TResult } from '../../utils/result.ts';
import type { MemberWithGroupProfile } from '../group-member-directory/MemberWithGroupProfile.ts';
import type { DaoException, IDaoRequestOptions, IDaoRequestQuery } from './dao-types.ts';

export interface IMemberWithGroupProfileRepository {
  getMany<R extends MemberWithGroupProfile, Q extends IDaoRequestQuery<R>>(
    param: IMemberWithGroupProfileRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;
}

export interface IMemberWithGroupProfileRepositoryGetManyParams<
  R extends MemberWithGroupProfile,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}
