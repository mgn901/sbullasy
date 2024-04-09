import {
  BelongsToNoGroupCertificate,
  type IBelongsToNoGroupCertificateProperties,
} from '../../model/certificates/BelongsToNoGroupCertificate.ts';
import { ApplicationErrorOrException } from '../../model/errors/ApplicationErrorOrException.ts';
import type { DaoException } from '../../model/repositories/dao-types.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';

export const belongsToNoGroupCertificateService = async <
  UserId extends IBelongsToNoGroupCertificateProperties['userId'],
>(param: {
  readonly userId: UserId;
  readonly implementationContainer: IImplementationContainer;
}): Promise<
  TResult<
    {
      readonly belongsToNoGroupCertificate: BelongsToNoGroupCertificate<UserId>;
    },
    StillBelongsToOneOrMoreGroupsException | DaoException
  >
> => {
  const getUserProfileResult = await param.implementationContainer.memberRepository.getMany({
    query: { userId: param.userId },
  });

  if (getUserProfileResult instanceof Failure) {
    return getUserProfileResult;
  }

  if (getUserProfileResult.value.items.length > 0) {
    return new Failure(
      new StillBelongsToOneOrMoreGroupsException({
        message: '一つ以上のグループに所属しています。',
      }),
    );
  }

  return new Success({
    belongsToNoGroupCertificate: BelongsToNoGroupCertificate.fromParam({ userId: param.userId }),
  });
};

export class StillBelongsToOneOrMoreGroupsException extends ApplicationErrorOrException {
  public readonly name = 'StillBelongsToOneOrMoreGroupsException';
}
