import type { TResult } from '../../utils/result.ts';
import type { MemberWithUserProfile } from '../group-member-directory/MemberWithUserProfile.ts';
import type { DaoException, IDaoRequestOptions, IDaoRequestQuery } from './dao-types.ts';

export interface IMemberWithUserProfileRepository {
  getMany<R extends MemberWithUserProfile, Q extends IDaoRequestQuery<R>>(
    param: IMemberWithUserProfileRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;
}

export interface IMemberWithUserProfileRepositoryGetManyParams<
  R extends MemberWithUserProfile,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}
